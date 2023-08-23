const express = require('express');
const app = express();
const database = require('./modules/database');
const puppeteer = require('puppeteer-core');
const db = require('./routes/db')
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

require('dotenv').config()
app.use(sessions({
    secret: process.env.secret,
    saveUninitialized:true,
    resave: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


let browser = null;
let page = null;
let pages = 0;
const myBrowserlessAPIKey = process.env['TOKEN']


async function openRegister(req,res,next){
    console.time("open");
    if (browser === null) {
        browser = await puppeteer.connect({ browserWSEndpoint: 'wss://chrome.browserless.io?token='+myBrowserlessAPIKey});
    }
    //go to login page
    page = await browser.newPage();
    await page.goto('https://registro.unah.edu.hn/pregra_estu_login.aspx');
    
    console.timeEnd("open");
    await next();
}

async function login(req,res,next){
  console.time("login");
    //login with credentials 
     page.type('#MainContent_txt_cuenta', req.body['cuenta']);
     await next();
}

async function login1(req,res,next){
     page.type('#MainContent_txt_clave', req.body['clave']);
     await next();
}

async function login2(req,res,next){
    await page.click('#MainContent_Button1');
    try {
      await page.waitForSelector('#MainContent_LinkButton2');
      
      await next();
    } catch (error) {
      res.status(500).send("Invalid Credentials");
      return;
    }
}

async function pageNumber(req,res,next){
  console.time("number");
    await page.click('#MainContent_LinkButton2');
  
    await page.waitForSelector('#MainContent_ASPxPageControl1_ASPxGridView2_DXMainTable');
  
    //get number of pages in history
    pages = await page.evaluate(() => {
      const data = document.getElementsByClassName('dxpSummary_Aqua');
      const myArray = data[0].innerHTML.split(" ");
      return myArray[3];
    });
    console.timeEnd("number");
    await next();
}

app.post('/api/register', openRegister, login, login1,login2, pageNumber, async function (req, res) {
  console.time("register");
    //JSON response
    const classRes = {
      "classes": [],
      "INFO": {}
    };
  
    for (let i = 0; i < pages; i++) {
      responseClass = await page.evaluate(() => { 
        const  clases = [];
        //get all elements of class table
        const elements = document.querySelectorAll('#MainContent_ASPxPageControl1_ASPxGridView2_DXMainTable tbody tr');
  
        for (let index = 9; index<elements.length; index++){
          clases.push({
              'CODIGO': elements[index].getElementsByTagName('td')[0].innerHTML,
              'ASIGNATURA': elements[index].getElementsByTagName('td')[1].innerHTML,
              'UV': elements[index].getElementsByTagName('td')[2].innerHTML,
              'SECCION': elements[index].getElementsByTagName('td')[3].innerHTML,
              'ANIO': elements[index].getElementsByTagName('td')[4].innerHTML,
              'PERIODO': elements[index].getElementsByTagName('td')[5].innerHTML,
              'CALIFICACION': elements[index].getElementsByTagName('td')[6].innerHTML,
              'OBS': elements[index].getElementsByTagName('td')[7].innerHTML
            });
        }
        return clases;
      });
      responseClass.forEach(clas => {
        classRes.classes.push(clas);
      });
    //next page in history
    await page.evaluate(() => {
      aspxGVPagerOnClick("MainContent_ASPxPageControl1_ASPxGridView2","PBN");
    });
    await page.waitForTimeout(600);
  }
  
  
    //get averanges
    const promedio = await page.evaluate(() => {
      const obj = {
          "Indice": {
              'global': document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel11').innerHTML,
              'periodo': document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel12').innerHTML
          },
          "Nombre": document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel8').innerHTML,
          "Carrera": document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel9').innerHTML
      };
      return obj;
    });
    classRes.INFO=promedio;
  
    await page.close();
    page = null;
    req.session.number = req.body.cuenta;
    req.session.key = req.body.clave;
    console.timeEnd("register");
    res.send(classRes);
    
});

app.post('/api/refresh1', async function (req, res) {
  if (browser === null) {
    browser = await puppeteer.connect({ browserWSEndpoint: 'wss://chrome.browserless.io?token='+myBrowserlessAPIKey});
  }
  //go to login page
  page = await browser.newPage();
  await page.goto('https://registro.unah.edu.hn/pregra_estu_login.aspx');
  res.send("ready");
    
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
    await page.waitForSelector('#MainContent_LinkButton2');
  } catch (error) {
    res.status(500).send("Invalid Credentials");
    return;
  }

  res.send("ready");
    
});

app.post('/api/refresh3', async function (req, res) {
 
  await page.click('#MainContent_LinkButton2');
  
  await page.waitForSelector('#MainContent_ASPxPageControl1_ASPxGridView2_DXMainTable');

  //get number of pages in history
  pages = await page.evaluate(() => {
    const data = document.getElementsByClassName('dxpSummary_Aqua');
    const myArray = data[0].innerHTML.split(" ");
    return myArray[3];
  });
  
  res.send("ready");
    
});

app.post('/api/refresh4', async function (req, res) {
 
    //JSON response
    const classRes = {
      "classes": [],
      "INFO": {}
    };
  
    for (let i = 0; i < pages; i++) {
      responseClass = await page.evaluate(() => { 
        const  clases = [];
        //get all elements of class table
        const elements = document.querySelectorAll('#MainContent_ASPxPageControl1_ASPxGridView2_DXMainTable tbody tr');
  
        for (let index = 9; index<elements.length; index++){
          clases.push({
              'CODIGO': elements[index].getElementsByTagName('td')[0].innerHTML,
              'ASIGNATURA': elements[index].getElementsByTagName('td')[1].innerHTML,
              'UV': elements[index].getElementsByTagName('td')[2].innerHTML,
              'SECCION': elements[index].getElementsByTagName('td')[3].innerHTML,
              'ANIO': elements[index].getElementsByTagName('td')[4].innerHTML,
              'PERIODO': elements[index].getElementsByTagName('td')[5].innerHTML,
              'CALIFICACION': elements[index].getElementsByTagName('td')[6].innerHTML,
              'OBS': elements[index].getElementsByTagName('td')[7].innerHTML
            });
        }
        return clases;
      });
      responseClass.forEach(clas => {
        classRes.classes.push(clas);
      });
    //next page in history
    await page.evaluate(() => {
      aspxGVPagerOnClick("MainContent_ASPxPageControl1_ASPxGridView2","PBN");
    });
  
    await page.waitForTimeout(600);
  }
  
  
    //get averanges
    const promedio = await page.evaluate(() => {
      const obj = {
          "Indice": {
              'global': document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel11').innerHTML,
              'periodo': document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel12').innerHTML
          },
          "Nombre": document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel8').innerHTML,
          "Carrera": document.getElementById('MainContent_ASPxRoundPanel2_ASPxLabel9').innerHTML
      };
      return obj;
    });
    classRes.INFO=promedio;
  
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

