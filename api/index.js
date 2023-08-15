let puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

export default async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: 'new',
    });
    const page = await browser.newPage();
    
    await page.goto(req.body.query)
    const pdfFIle = await page.pdf({format: 'A4'})

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated-pdf.pdf');
    res.send(pdfFIle);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
