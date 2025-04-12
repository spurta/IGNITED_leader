const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const app = express();

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const reportUrl = `https://leonpurton.com/ignited-results/?entry=${entry}`;
  console.log(`📄 Generating PDF for entry ${entry}...`);

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1600 });
    await page.goto(reportUrl, { waitUntil: 'networkidle2', timeout: 0 });

    try {
      await page.waitForSelector('#reportContent', { timeout: 15000 });
      console.log("✅ Found #reportContent");
    } catch (e) {
      console.warn("⚠️ #reportContent not found in time, using manual delay...");
      await page.waitForTimeout(5000);
    }

    await page.waitForTimeout(1500);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', bottom: '1in', left: '0.5in', right: '0.5in' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ignited-report-entry-${entry}.pdf"`,
      'Content-Length': pdf.length
    });

    res.send(pdf);
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    res.status(500).send('Failed to generate PDF');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Puppeteer PDF server running on port ${PORT}`);
});
