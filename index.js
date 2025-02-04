const express = require('express');
const app = express();
const database = require('./modules/database');
const puppeteer = require('puppeteer-core');
const db = require('./routes/db')
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const cors = require('cors');

require('dotenv').config()
app.use(sessions({
    secret: process.env.secret,
    saveUninitialized:true,
    resave: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: 'https://is-manager-astro.vercel.app',
  credentials: true,
};
app.use(cors(corsOptions));

let browser = null;
let page = null;
let pages = 0;
let currentPage = 0;
const myBrowserlessAPIKey = process.env['TOKEN']

app.post('/api/register', async function (req, res) {

  await page.type('#MainContent_txt_cuenta', req.body['cuenta']);
  await page.type('#MainContent_txt_clave', req.body['clave']);
  await page.click('#MainContent_Button1');

  //go to history
  try {
    await page.waitForSelector('#MainContent_LinkButton2');
      req.session.number = req.body['cuenta'];
      req.session.key = req.body['clave']
  } catch (error) {
    res.status(500).send("Invalid Credentials");
    return;
  }

  res.send('{"status":"ready"}');
});

app.post('/api/refresh1', async function (req, res) {
  if (browser === null) {
    browser = await puppeteer.connect({ browserWSEndpoint: 'wss://chrome.browserless.io?token='+myBrowserlessAPIKey});
  }
  //go to login page
  page = await browser.newPage();
  await page.goto('https://serviciosestudiantiles.unah.edu.hn/Estudiantes/LoginEstudiantes.aspx');
  
  res.send('{"status":"ready"}');
    
});

app.post('/api/refresh2', async function (req, res) {
  
  if (req.session.number == undefined) {
    res.status(500).send(`Not Logger`)
    return;
  }

  //login with credentials 
  await page.type('#MainContent_txt_cuenta', req.session.number);
  await page.type('#MainContent_txt_clave', req.session.key);
  await page.click('#MainContent_Button1');

  //go to history
  try {
    await page.waitForSelector('#MainContent_LinkButton13');
  } catch (error) {
    res.status(500).send("Invalid Credentials");
    return;
  }
  
  res.send('{"status":"ready"}');
    
});

app.post('/api/refresh3', async function (req, res) {
 
  await page.click('#MainContent_LinkButton13');
  
  await page.waitForSelector('#MainContent_GridView1');

  //get number of pages in history
  pages = await page.evaluate(() => {
    const pagerLinks = document.querySelectorAll('#MainContent_GridView1 tbody tr.GridPager td table tbody tr td a');
    return pagerLinks.length + 1;
  });
  currentPage = 0;
  
  res.json({pages});
    
});

app.get('/api/getUserInfo', async (req, res) => {
  await page.waitForSelector('#MainContent_Label1', { timeout: 5000 }).catch(() => null);

  const userInfo = await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : "N/A";
    };

    return {
      "Cuenta": getText('#MainContent_Label1'),
      "Centro": getText('#MainContent_Label4'),
      "Nombre": getText('#MainContent_Label2'),
      "Carrera": getText('#MainContent_Label3'),
      "Indice": {
        "global": getText('#MainContent_Label6'),
        "periodo": getText('#MainContent_Label5')
      }
    };
  });

  res.json(userInfo);
});


app.post('/api/refresh4', async function (req, res) {
  const classRes = {
    "classes": [],
    "INFO": {}
  };

  for (let i = 1; i <= pages; i++) {
    await page.waitForSelector('#MainContent_GridView1 tbody tr:not(.GridPager)', { timeout: 5000 }).catch(() => null);

    const pageData = await page.evaluate(() => {
      const rows = document.querySelectorAll('#MainContent_GridView1 tbody tr:not(.GridPager)');
      let data = [];

      rows.forEach((row, index) => {
        if (index === 0) return; // Omitir encabezado
        const cols = row.querySelectorAll('td');
        console.log(`row ${row}`);
        

        if (cols.length > 0) {
          data.push({
            CODIGO: cols[0]?.textContent?.trim() || "N/A",
            ASIGNATURA: cols[1]?.textContent?.trim() || "N/A",
            UV: cols[2]?.textContent?.trim() || "N/A",
            SECCION: cols[3]?.textContent?.trim() || "N/A",
            ANIO: cols[4]?.textContent?.trim() || "N/A",
            PERIODO: cols[5]?.textContent?.trim() || "N/A",
            CALIFICACION: cols[6]?.textContent?.trim() || "N/A",
            OBS: cols[7]?.textContent?.trim() || "N/A",
          });
        }
      });

      return data;
    });

    classRes.classes = classRes.classes.concat(pageData);

    // Ir a la siguiente página si no es la última
    if (i < pages) {
      await page.evaluate((pageNum) => {
        const nextPageLink = document.querySelector(`#MainContent_GridView1 tbody tr.GridPager td table tbody tr td a:nth-child(${pageNum})`);
        if (nextPageLink) nextPageLink.click();
      }, i + 1);

      // Esperar que cargue la nueva página
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => null);
      await page.waitForSelector('#MainContent_GridView1 tbody tr:not(.GridPager)', { timeout: 5000 }).catch(() => null);
    }
  }

  // Esperar los elementos antes de extraer información
  await page.waitForSelector('#MainContent_Label1', { timeout: 5000 }).catch(() => null);

  const userInfo = await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : "N/A";
    };

    return {
      "Cuenta": getText('#MainContent_Label1'),
      "Centro": getText('#MainContent_Label4'),
      "Nombre": getText('#MainContent_Label2'),
      "Carrera": getText('#MainContent_Label3'),
      "Indice": {
        "global": getText('#MainContent_Label6'),
        "periodo": getText('#MainContent_Label5')
      }
    };
  });

  classRes.INFO = userInfo;

  await page.close();
  page = null;

  res.json(classRes);
});

app.get('/api/getAllPages', async (req, res) => {
  let allData = [];
  
  for (let i = 1; i <= pages; i++) {
    const response = await fetch(`https://tu-api.vercel.app/api/getPageData?pageNum=${i}`);
    const data = await response.json();
    allData = allData.concat(data.data);
  }

  res.json({ classes: allData });
});

app.get('/api/getPageData', async (req, res) => {
  const { pageNum } = req.query;
  if (!pageNum) return res.status(400).json({ error: "Se requiere el número de página" });

  const pageIndex = parseInt(pageNum);

  await page.waitForSelector('#MainContent_GridView1 tbody tr:not(.GridPager)', { timeout: 5000 }).catch(() => null);

  const pageData = await page.evaluate(() => {
    const rows = document.querySelectorAll('#MainContent_GridView1 tbody tr:not(.GridPager)');
    let data = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Omitir encabezado
      const cols = row.querySelectorAll('td');

      if (cols.length > 0) {
        data.push({
          CODIGO: cols[0]?.textContent?.trim() || "N/A",
          ASIGNATURA: cols[1]?.textContent?.trim() || "N/A",
          UV: cols[2]?.textContent?.trim() || "N/A",
          SECCION: cols[3]?.textContent?.trim() || "N/A",
          ANIO: cols[4]?.textContent?.trim() || "N/A",
          PERIODO: cols[5]?.textContent?.trim() || "N/A",
          CALIFICACION: cols[6]?.textContent?.trim() || "N/A",
          OBS: cols[7]?.textContent?.trim() || "N/A",
        });
      }
    });

    return data;
  });

  res.json({ page: pageIndex, data: pageData });
});


app.use('/api/db', db);

app.get('/api/test', (req, res) => {
  res.send('Done!')
});

app.use('/', express.static('public'))

app.listen(process.env.NODE_PORT, async () => {
  browser = await puppeteer.connect({ browserWSEndpoint: 'wss://chrome.browserless.io?token='+myBrowserlessAPIKey});
    console.log(`Server started on port ${process.env.NODE_PORT}`);
});

