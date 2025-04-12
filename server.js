import express from 'express';
import { jsPDF } from 'jspdf';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

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

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    await doc.html(reportContent, {
      callback: (doc) => {
        const pdf = doc.output('arraybuffer');
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="ignited-report-entry-${entry}.pdf"`,
          'Content-Length': pdf.byteLength
        });
        res.send(Buffer.from(pdf));
      },
      x: 20,
      y: 20,
      width: 555
    });
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    res.status(500).send('Failed to generate PDF');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 jsPDF PDF server running on port ${PORT}`);
});
