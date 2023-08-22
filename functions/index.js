const express = require('express');
const serverless = require('serverless-http');
const puppeteer = require('puppeteer');
const app = express();
const router = express.Router();

let browser = null;
let page = null;
let pages = 0;

//Get all students
router.get('/', (req, res) => {
  res.send('App is running..');
});

router.get('/test', async (req, res) => {
    if (browser === null) {
        const browser = await puppeteer.launch();
    }
    //go to login page
    page = await browser.newPage();
    await page.goto('https://registro.unah.edu.hn/pregra_estu_login.aspx', {waitUntil: 'domcontentloaded'});
    res.send(await page.content())
  });
  
  

app.use('/.netlify/functions/index', router);
module.exports.handler = serverless(app);