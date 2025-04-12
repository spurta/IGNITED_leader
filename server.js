import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import pdf from 'html-pdf-node';

const app = express();

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const reportUrl = `https://leonpurton.com/ignited-results/?entry=${entry}`;
  console.log(`📄 Generating PDF for entry ${entry}...`);

  try {
    const response = await fetch(reportUrl);
    const html = await response.text();

    const dom = new JSDOM(html);
    const { document } = dom.window;
    const reportContent = document.querySelector('#reportContent');

    if (!reportContent) throw new Error("#reportContent not found");

    const fullHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; }
          </style>
        </head>
        <body>
          ${reportContent.outerHTML}
        </body>
      </html>
    `;

    const file = { content: fullHtml };
    const options = { format: 'A4' };

    pdf.generatePdf(file, options).then(buffer => {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ignited-report-entry-${entry}.pdf"`,
        'Content-Length': buffer.length
      });
      res.send(buffer);
    }).catch(err => {
      console.error('❌ PDF Generation Error:', err.message);
      res.status(500).send('Failed to generate PDF');
    });
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    res.status(500).send('Failed to generate PDF');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 html-pdf-node server running on port ${PORT}`);
});
