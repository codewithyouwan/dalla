const fs = require('fs/promises');
const path = require('path');

exports.handler = async (event, context) => {
  const sessionId = event.pathParameters?.sessionId;
  const pdfPath = path.join('/tmp/resume_temp', `resume-${sessionId}.pdf`);

  try {
    const pdfBuffer = await fs.readFile(pdfPath);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=resume-${sessionId}.pdf`,
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error serving resume:', error.message, error.stack);
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Failed to serve resume: ${error.message}` }),
    };
  }
};