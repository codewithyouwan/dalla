const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '未入力';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

handlebars.registerHelper('math', function (value, operator, operand) {
  const numValue = parseFloat(value);
  const numOperand = parseFloat(operand);
  switch (operator) {
    case '+': return numValue + numOperand;
    case '-': return numValue - numOperand;
    case '*': return numValue * numOperand;
    case '/': return numValue / numOperand;
    default: return value;
  }
});

exports.handler = async (event, context) => {
  let pdfPath;
  try {
    const formData = new FormData();
    const body = JSON.parse(event.body || '{}');
    Object.entries(body).forEach(([key, value]) => formData.append(key, value));
    const detailsRaw = formData.get('details');
    const sessionId = formData.get('sessionId') || uuidv4();
    const photo = formData.get('photo');

    console.log('Raw form-data details:', detailsRaw);
    console.log('Raw form-data sessionId:', sessionId);
    console.log('PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR || '/tmp/.puppeteer_cache');

    let details;
    try {
      details = JSON.parse(detailsRaw || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      return { statusCode: 400, body: JSON.stringify({ error: `Invalid JSON: ${parseError.message}` }) };
    }

    if (!details.id_number || typeof details.id_number !== 'string' || details.id_number.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'id_number required' }) };
    }

    const escapedDetails = {
      ...details,
      employeeNumber: escapeHtml(details.employeeNumber),
      name: escapeHtml(details.name),
      selectedName: escapeHtml(details.selectedName || details.name),
      japaneseLevel: escapeHtml(details.japaneseLevel || details.selectedSuggestion),
      personality: escapeHtml(details.personality),
      hobby: escapeHtml(details.hobby || '未入力'),
      desiredIndustry: escapeHtml(details.desiredIndustry || '未入力'),
      desiredJobType: escapeHtml(details.desiredJobType || '未入力'),
      education: Array.isArray(details.education)
        ? details.education.map((edu) => ({
            year: escapeHtml(edu.year || '未入力'),
            institution: escapeHtml(edu.institution || '未入力'),
            major: escapeHtml(edu.major || '未入力'),
            degree: escapeHtml(edu.degree || '未入力'),
          }))
        : [{ year: '未入力', institution: '未入力', degree: '未入力' }],
      internships: details.internships || [],
      projects: details.projects || [],
    };

    const tempDir = '/tmp/resume_temp';
    await fs.mkdir(tempDir, { recursive: true });
    pdfPath = path.join(tempDir, `resume-${sessionId}.pdf`);

    const templatePath = path.join(process.cwd(), 'src', 'app', 'helper', 'resume.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);

    let photoBase64 = '';
    if (photo && photo.size > 0) {
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const metadata = await sharp(photoBuffer).metadata();
      if (metadata.format !== 'jpeg') {
        throw new Error('Only JPEG supported.');
      }
      if (metadata.width !== 280 || metadata.height !== 360) {
        throw new Error('Image must be 280x360 pixels.');
      }
      if (photoBuffer.length > 5 * 1024 * 1024) {
        throw new Error('Photo exceeds 5MB.');
      }
      photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
    }

    const htmlContent = template({ ...escapedDetails, photo: photoBase64 });
    console.log('Generated HTML length:', htmlContent.length);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    console.log('Browser launched successfully with Chromium');
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
    await page.emulateMediaType('print');

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true,
    });

    console.log('PDF generated at:', pdfPath);
    await browser.close();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Resume generated',
        downloadUrl: `/api/serveTemp/${sessionId}`,
        sessionId,
      }),
    };
  } catch (error) {
    console.error('Error generating resume:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Failed to generate resume: ${error.message}` }),
    };
  }
};