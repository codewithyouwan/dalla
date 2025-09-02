import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

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
    case '+':
      return numValue + numOperand;
    case '-':
      return numValue - numOperand;
    case '*':
      return numValue * numOperand;
    case '/':
      return numValue / numOperand;
    default:
      return value;
  }
});

export async function POST(req) {
  let pdfPath;
  try {
    const formData = await req.formData();
    const detailsRaw = formData.get('details');
    const sessionId = formData.get('sessionId') || uuidv4();
    const photo = formData.get('photo');

    console.log('Raw form-data details:', detailsRaw);
    console.log('Raw form-data sessionId:', sessionId);
    console.log('PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR || '/tmp/.puppeteer_cache');
    console.log('Attempting to launch Puppeteer with Chromium');

    let details;
    try {
      details = JSON.parse(detailsRaw || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      return NextResponse.json({ error: `Invalid JSON: ${parseError.message}` }, { status: 400 });
    }

    if (!details.id_number || typeof details.id_number !== 'string' || details.id_number.trim() === '') {
      return NextResponse.json({ error: 'id_number required' }, { status: 400 });
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
      targetRole: escapeHtml(details.targetRole || '未入力'),
      workStyle: escapeHtml(details.workStyle || '未入力'),
      languages: escapeHtml(details.languages),
      devTools: escapeHtml(details.devTools),
      projectRole: escapeHtml(details.projectRole),
      projectDescription: escapeHtml(details.projectDescription),
      projectChallenges: escapeHtml(details.projectChallenges),
      leadership: escapeHtml(details.leadership),
      careerPriorities: escapeHtml(details.WorkValues || '未入力'),
      careerRoles: escapeHtml(details.careerRoles || '未入力'),
      education: Array.isArray(details.education)
        ? details.education.slice(0, 4).map((edu) => {
            let institution = escapeHtml(edu.institution || '未入力');
            let major = '';
            const match = institution.match(/^(.*)\s*\*\*\[(.*?)\]\*\*$/);
            if (match) {
              institution = match[1].trim();
              major = match[2].trim();
            }
            return {
              year: escapeHtml(edu.year || '未入力'),
              institution,
              major,
              degree: escapeHtml(edu.degree || '未入力'),
            };
          })
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

    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
      console.log('Browser launched successfully with Chromium');
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
      });

      console.log('PDF generated at:', pdfPath);
      await browser.close();
    } catch (browserError) {
      console.error('Puppeteer launch error:', browserError.message, browserError.stack);
      throw browserError;
    }

    return NextResponse.json({
      message: 'Resume generated',
      downloadUrl: `/api/serveResume/${sessionId}`,
      sessionId,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error.message, error.stack);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  }
}