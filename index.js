const express = require('express');
const app = express();
require('dotenv').config()
const chrome = require('chrome-aws-lambda');

app.get('/', (req, res) => {
    res.send("init IS-manager")
});

var browser = null;
var page = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function miMiddleware(req,res,next){
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
    console.log(browser);
    page = await browser.newPage();
    await page.goto('https://registro.unah.edu.hn/pregra_estu_login.aspx');
    //await sleep(4 * 1000);
    next();
}

app.get('/login/:clave/:valor', miMiddleware, async function(req,res){
   /* Se ejecutará esta función luego del middleware */
   //await sleep(6 * 1000);
   res.send("init IS-manager")
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