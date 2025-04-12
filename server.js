const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/pdf', async (req, res) => {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Poppins', sans-serif; padding: 40px; }
          h1 { color: #3d6cb6; }
          .chart { margin: 2rem 0; }
        </style>
      </head>
      <body>
        <h1>Your IGNITED Leadership Self-Assessment</h1>
        <p>This report outlines your strengths and growth opportunities across the seven IGNITED traits.</p>
        <div class="chart">[Radar chart image would go here]</div>
        <p>Reflections coming soon...</p>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=ignited-leader-report.pdf'
  });
  res.send(pdfBuffer);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
