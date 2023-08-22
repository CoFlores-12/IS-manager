const express = require('express');
const serverless = require('serverless-http');
const chrome = require('chrome-aws-lambda');
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
    await page.goto('https://registro.unah.edu.hn/pregra_estu_login.aspx', {waitUntil: 'domcontentloaded'});
    res.send(await page.content())
  });
  
  

app.use('/api', router);
module.exports.handler = serverless(app);