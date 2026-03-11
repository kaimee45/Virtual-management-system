import http from 'http';
import { chromium } from 'playwright';

// 1. Start a simple server to catch the error
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => { 
      if(body) console.log("\n\n=== CAUGHT REACT ERROR ===\n", body, "\n==========================\n\n"); 
      res.end('ok'); 
  });
}).listen(9999, async () => {
  console.log("Listening for errors on 9999...");
  
  // 2. Launch browser to trigger the frontend crash
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/admin');
    await page.waitForTimeout(3000); // Give it 3s to crash and send the POST
    await browser.close();
    server.close();
  } catch(e) {
    console.log("Browser error:", e);
    server.close();
  }
});
