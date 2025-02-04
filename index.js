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
  
  res.send("ready");
    
});

app.post('/api/refresh4', async function (req, res) {
 
    //JSON response
    const classRes = {
      "classes": [],
      "INFO": {}
    };
  
    for (let i = 1; i <= pages; i++) {
  
      const pageData = await page.evaluate(() => {
        const rows = document.querySelectorAll('#MainContent_GridView1 tbody tr:not(.GridPager)');
        let data = [];
  
        rows.forEach(row => {
          const cols = row.querySelectorAll('td');
          if (cols.length > 0) {
            data.push({
              CODIGO: cols[0].textContent.trim(),
              ASIGNATURA: cols[1].textContent.trim(),
              UV: cols[2].textContent.trim(),
              SECCION: cols[3].textContent.trim(),
              ANIO: cols[4].textContent.trim(),
              PERIODO: cols[5].textContent.trim(),
              CALIFICACION: cols[6].textContent.trim(),
              OBS: cols[7].textContent.trim(),
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
  
        await page.waitForTimeout(1000); // Esperar a que cargue la nueva página
      }
    }
  
  
    //get averanges
    const userInfo = await page.evaluate(() => {
      return {
        "Cuenta": document.querySelector('#MainContent_Label1')?.textContent.trim() || "N/A",
        "Centro": document.querySelector('#MainContent_Label4')?.textContent.trim() || "N/A",
        "Nombre": document.querySelector('#MainContent_Label2')?.textContent.trim() || "N/A",
        "Carrera": document.querySelector('#MainContent_Label3')?.textContent.trim() || "N/A",
        "Indice": {
          "global": document.querySelector('#MainContent_Label6')?.textContent.trim() || "N/A",
          "periodo": document.querySelector('#MainContent_Label5')?.textContent.trim() || "N/A"
        }
      };
    });
    classRes.INFO=userInfo;
  
    await page.close();
    page = null;
    
    res.send(classRes);
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

