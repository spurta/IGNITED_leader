
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/pdf', async (req, res) => {
  const entryId = req.query.entry;
  if (!entryId) return res.status(400).send('Missing entry');

  const targetUrl = `https://leonpurton.com/ignited-results/?entry=${entryId}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#reportContent', { timeout: 10000 });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1in', bottom: '1in', left: '0.5in', right: '0.5in' }
  });

  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="ignited-report-entry-${entryId}.pdf"`,
  });

  res.send(pdfBuffer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PDF server running on port ${PORT}`));
