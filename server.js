const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const reportUrl = `https://leonpurton.com/ignited-results/?entry=${entry}`;
  console.log(`📄 Generating PDF for entry ${entry}...`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set a realistic viewport
    await page.setViewport({ width: 1280, height: 1600 });

    // Go to the live report page
    await page.goto(reportUrl, { waitUntil: 'networkidle2', timeout: 0 });

    // Wait for the reportContent element to appear
    await page.waitForSelector('#reportContent', { timeout: 15000 });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', bottom: '1in', left: '0.5in', right: '0.5in' }
    });

    await browser.close();

    // Send PDF as attachment
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Puppeteer PDF server running on port ${PORT}`);
});
