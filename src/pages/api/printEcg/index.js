const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const browserCache = new Map();

async function launchChromium() {
  if (browserCache.has('browser')) {
    console.log('Using cached Chromium browser');
    return browserCache.get('browser');
  }

  console.log('No cached Chromium browser found. Launching Chromium...');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: 'new',
  });

  browserCache.set('browser', browser);

  return browser;
}

export default async (req, res) => {
  try {
    const browser = await launchChromium();
    const page = await browser.newPage();

    await page.goto(req.body.query);
    const pdfFile = await page.pdf({ format: 'A4' });

    await page.close(); // Закрываем страницу, чтобы освободить ресурсы
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated-pdf.pdf');
    res.send(pdfFile);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
