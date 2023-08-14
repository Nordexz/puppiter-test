/* eslint-disable import/no-anonymous-default-export */
// import puppeteer from '../../../../node_modules/puppeteer';
let puppeteer = require('../../../../node_modules/puppeteer-core');

// if (process.env.AWS_LAMBDA_FUNCTION_VERSION) puppeteer = require('../../../../node_modules/puppeteer-core');
const chromium = require('chrome-aws-lambda');

export default async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    
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
