let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  puppeteer = require('../../../../node_modules/puppeteer-core');
} else {
  puppeteer = require('../../../../node_modules/puppeteer');
}
const chromium = require('chrome-aws-lambda');

const cache = new Map(); // Используем Map для хранения кэша

async function launchChromium() {
  const cachedConfig = cache.get('chromiumConfig');

  if (cachedConfig) {
    console.log('Using cached Chromium configuration');
    return cachedConfig;
  }

  console.log('No cached Chromium configuration found. Launching Chromium...');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: 'new',
  });

  const chromiumConfig = {
    browser,
  };

  cache.set('chromiumConfig', chromiumConfig);

  return chromiumConfig;
}

export default async (req, res) => {
  try {
    const { browser } = await launchChromium();
    const page = await browser.newPage();

    await page.goto(req.body.query);
    const pdfFile = await page.pdf({ format: 'A4' });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated-pdf.pdf');
    res.send(pdfFile);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
