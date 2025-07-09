// Use CommonJS imports
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Path to your local PDF file
const filePath = './public/sample/Resume-Sample.pdf';

const readAndParsePDF = async () => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    console.log('--- Parsed Resume Text ---\n');
    console.log(data.text);

    console.log('\n--- PDF Info ---');
    console.log('Pages:', data.numpages);
    console.log('Title:', data.info?.Title || 'N/A');
  } catch (err) {
    console.error('Error parsing PDF:', err);
  }
};

readAndParsePDF();
