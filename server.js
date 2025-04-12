import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch'; // required since fetch is not in Node 18 or earlier
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

// Fix for __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const reportUrl = `https://leonpurton.com/ignited-results/?entry=${entry}`;
  console.log(`📄 Generating PDF for entry ${entry}...`);

  try {
    const response = await fetch(reportUrl);
    const html = await response.text();

    const dom = new JSDOM(html);
    const reportContent = dom.window.document.querySelector('#reportContent');
    if (!reportContent) throw new Error("#reportContent not found");

    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(12);
    doc.text("IGNITED Report", 10, 10);
    doc.text(reportContent.textContent.trim(), 10, 20, { maxWidth: 190 });

    const pdf = doc.output('arraybuffer');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ignited-report-entry-${entry}.pdf"`,
      'Content-Length': pdf.byteLength
    });
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    res.status(500).send('Failed to generate PDF');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 jsPDF PDF server running on port ${PORT}`);
});
