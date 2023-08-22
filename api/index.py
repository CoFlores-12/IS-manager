
import asyncio
from pyppeteer import launch

async def main():
    browser = await launch(handleSIGINT=False, handleSIGTERM=False, handleSIGHUP=False, options={'args': ['--no-sandbox']})
    page = await browser.newPage()
    await page.goto('https://quotes.toscrape.com/')
    await browser.close()

asyncio.get_event_loop().run_until_complete(main())

from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
        self.wfile.write('Hello, world!'.encode('utf-8'))
        return