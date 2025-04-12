const express = require('express');
const { readFileSync } = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const { JSDOM } = require('jsdom');
const app = express();

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const reportUrl = `https://leonpurton.com/ignited-results/?entry=${entry}`;
  console.log(`📄 Generating PDF for entry ${entry}...`);

  try {
    // Fetch content
    const response = await fetch(reportUrl);
    const html = await response.text();

    // Use jsdom to parse the HTML
    const dom = new JSDOM(html);
    const reportContent = dom.window.document.querySelector('#reportContent');

    if (!reportContent) throw new Error("#reportContent not found");

    // Prepare content
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(12);
    doc.text("IGNITED Report", 10, 10);
    doc.text(reportContent.textContent.trim(), 10, 20, { maxWidth: 190 });

    // Finalize and send
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
