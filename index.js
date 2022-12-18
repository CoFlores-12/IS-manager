const express = require('express');
const chrome = require('chrome-aws-lambda');
const app = express();
require('dotenv').config()

app.use('/',express.static(__dirname + '/public'));

let browser = null;
let page = null;
let pages = 0;

async function openRegister(req,res,next){
  if (browser === null) {
      browser = await chrome.puppeteer.launch({
          args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
      });
  }
  //go to login page
  page = await browser.newPage();
  await page.goto('https://registro.unah.edu.hn/pregra_estu_login.aspx');
  await next();
}

async function login(req,res,next){
  //login with credentials 
  await page.type('#MainContent_txt_cuenta', req.params['cuenta']);
  await page.type('#MainContent_txt_clave', req.params['clave']);
  await page.click('#MainContent_Button1');

  //go to history
  try {
    await page.waitForSelector('#MainContent_LinkButton2');
  } catch (error) {
    res.status(504).send("Login not found")
    return;
  }
  await next();
}

async function pageNumber(req,res,next){
  
  await page.click('#MainContent_LinkButton2');

  await page.waitForSelector('#MainContent_ASPxPageControl1_ASPxGridView2_DXMainTable');

  //get number of pages in history
  pages = await page.evaluate(() => {
    const data = document.getElementsByClassName('dxpSummary_Aqua');
    const myArray = data[0].innerHTML.split(" ");
    return myArray[3];
  });
  
  await next();
}

app.get('/getData/:cuenta/:clave', openRegister, login, pageNumber, async function (req, res) {
  
  //JSON response
  const classRes = {
    "class": [],
    "INFO": {}
  };

  for (let i = 0; i < pages; i++) {
    classRes.class.push(await page.evaluate(() => { 
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
      }));
    
    //next page in history
    await page.evaluate(() => {
      aspxGVPagerOnClick("MainContent_ASPxPageControl1_ASPxGridView2","PBN");
    });

    await page.waitForTimeout(900);
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

app.listen(process.env.NODE_PORT, async () => {
    browser = await chrome.puppeteer.launch({
        args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    });
    console.log(`Server started on port ${process.env.NODE_PORT}`);
    
});