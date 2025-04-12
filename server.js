const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const html = `
    <html>
      <head><title>IGNITED Report</title></head>
      <body>
        <h1>IGNITED Report for Entry ${entry}</h1>
        <p>This is your test content.</p>
      </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ignited-report-entry-${entry}.pdf"`,
      'Content-Length': pdf.length
    });

    res.send(pdf);
  } catch (err) {
    console.error('❌ PDF Generation Error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

// ✅ Make sure you're using process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
