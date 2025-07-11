import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '未入力';
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '\'')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export async function POST(req) {
  let pdfPath;
  try {
    const formData = await req.formData();
    const detailsRaw = formData.get('details');
    const sessionId = formData.get('sessionId') || uuidv4();
    const photo = formData.get('photo');

    console.log('Raw form-data details:', detailsRaw);
    console.log('Raw form-data sessionId:', sessionId);

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
  japaneseLevel: escapeHtml(details.japaneseLevel || details.selectedSuggestion),
  personality: escapeHtml(details.personality),
  devField: escapeHtml(details.devField || '未入力'),
  jobType: escapeHtml(details.jobType || '未入力'),
  domain: escapeHtml(details.domain || '未入力'),
  type: escapeHtml(details.type || '未入力'),
  languages: escapeHtml(details.languages),
  devTools: escapeHtml(details.devTools),
  projectRole: escapeHtml(details.projectRole),
  projectDescription: escapeHtml(details.projectDescription),
  projectChallenges: escapeHtml(details.projectChallenges),
  leadership: escapeHtml(details.leadership),
  careerPriorities: Array.isArray(details.careerPriorities)
    ? details.careerPriorities.map(p => escapeHtml(p || '未入力'))
    : ['未入力', '未入力', '未入力'],
  careerRoles: escapeHtml(details.careerRoles || '未入力'),
  education: Array.isArray(details.education)
    ? details.education.slice(0, 4).map((edu) => ({
        year: escapeHtml(edu.year || '未入力'),
        institution: escapeHtml(edu.institution || '未入力'),
        degree: escapeHtml(edu.degree || '未入力'),
      }))
    : [{ year: '未入力', institution: '未入力', degree: '未入力' }],
};

    const tempDir = path.join(process.cwd(), 'temp');
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
    console.log('Generated HTML:', htmlContent);

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
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

    return NextResponse.json({
      message: 'Resume preview generated',
      previewUrl: `resume-${sessionId}.pdf`,
      tempPdfPath: pdfPath,
      sessionId,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error.message);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  }
}