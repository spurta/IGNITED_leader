import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.get('/pdf', async (req, res) => {
  const { entry } = req.query;
  if (!entry) return res.status(400).send('Missing entry');

  const reportUrl = `https://leonpurton.com/ignited-results/?entry=${entry}`;
  const apiUrl = `https://api.html2pdf.app/v1/generate?url=${encodeURIComponent(reportUrl)}&apiKey=Qm4b18z0BjccgwIXlWMIzFEKLKG8HbyXXBTJoru0tLfm3HVUzsNI9lP0Uxikwb6m&pdf.pageSize=A4&pdf.margin=1cm`;

  try {
    console.log(`📄 Generating PDF for entry ${entry} via html2pdf.app...`);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch PDF from html2pdf.app");

    const buffer = await response.arrayBuffer();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ignited-report-entry-${entry}.pdf"`,
      'Content-Length': buffer.byteLength
    });
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    res.status(500).send('Failed to generate PDF');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 html2pdf.app proxy running on port ${PORT}`);
});
