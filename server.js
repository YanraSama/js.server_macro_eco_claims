const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const http = require("http");

puppeteer.use(StealthPlugin());

let browser;
let cacheCSV = "loading...";

// 🔥 init navigateur
async function init() {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  console.log("✅ Browser lancé");
}

// 🔥 scrape + CSV
async function scrape() {
  let page;

  try {
    page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto("https://ec.forexprostools.com/?columns=exc_currency,exc_importance,exc_date,exc_time&countries=5,72,4,6,25,7,22,43&importance=3&calType=day&timeZone=17&lang=1", {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    // ⏳ laisser charger JS
    await new Promise(r => setTimeout(r, 5000));

    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      let result = [];

      rows.forEach(row => {
        const cols = row.querySelectorAll("td");
		
		console.log(" : http://localhost:3000");
		console.log("🚀 API : http://localhost:3000");
		console.log("🚀 API : http://localhost:3000");
		console.log("🚀 API : http://localhost:3000");

        // 🔥 ignore lignes inutiles
        if (cols.length >= 4 && cols[0].innerText.trim() !== "" && cols[0].innerText.trim() !== "All Day") {
          result.push({
            time: cols[3]?.innerText.trim(),
            currency: cols[0]?.innerText.trim(),
            impact: cols[1]?.innerText.trim(),
            date: cols[2]?.innerText.trim()
          });
		  
		  
		  
        }
      });

      return result;
    });

    // 🔥 CSV propre
    let csv = "";

    data.forEach(r => {
      csv += `${r.currency},${r.impact},${r.date}\n`;
    });

    cacheCSV = csv;

    console.log("✅ Updated:", new Date().toLocaleTimeString());

  } catch (err) {
    console.log("❌ Error:", err.message);
  } finally {
    if (page) await page.close();
  }
}

// 🔁 boucle auto (toutes les 30 sec)
async function start() {
  await init();

  await scrape(); // premier run

  setInterval(scrape, 30000);
}

// 🌐 serveur HTTP
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(cacheCSV);
}).listen(3000, () => {
  console.log("🚀 API READY : http://localhost:3000");
});

// 🚀 start
start();