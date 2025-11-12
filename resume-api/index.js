const express = require('express');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const tempPath = path.join(process.cwd(), 'temp');
app.use('/temp', express.static(tempPath));
// Escape HTML function
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

// Handlebars math helper
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

app.use(cors()); // Allow requests from your Next.js app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("X-Frame-Options", "ALLOWALL"); 
  res.setHeader("Content-Security-Policy", "frame-ancestors *"); 
  next();
});

// Resume generation endpoint
app.post('/api/resume', upload.fields([{ name: 'details' }, { name: 'photo' }, { name: 'sessionId' }]), async (req, res) => {
  let pdfPath;
  try {
    const { details: detailsRaw, sessionId = uuidv4() } = req.body;
    const photo = req.files?.photo?.[0];

    let details;
    try {
      details = JSON.parse(detailsRaw || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: `Invalid JSON: ${parseError.message}` });
    }

    if (!details.id_number || typeof details.id_number !== 'string' || details.id_number.trim() === '') {
      return res.status(400).json({ error: 'id_number required' });
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

    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    pdfPath = path.join(tempDir, `resume-${sessionId}.pdf`);

    const templatePath = path.join(__dirname, 'resume.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);

    let photoBase64 = '';                                   // <-- will be passed to HBS

      if (photoFile?.buffer) {
        console.log(
          'Photo received →',
          photoFile.originalname,
          photoFile.buffer.length,
          'bytes'
        );

        const photoBuffer = photoFile.buffer;                 // <-- **Node Buffer**
        const metadata = await sharp(photoBuffer).metadata();

        // ---- validation ----
        if (metadata.format !== 'jpeg') throw new Error('Only JPEG supported.');
        if (metadata.width !== 280 || metadata.height !== 360)
          throw new Error(`Photo must be 280×360 px (got ${metadata.width}×${metadata.height})`);
        if (photoBuffer.length > 5 * 1024 * 1024) throw new Error('Photo >5 MB');

        // ---- convert to data-URL ----
        photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
      } else {
        console.log('No photo uploaded – will try fallback from details.photo_url');
      }

      // ---------- 4. OPTIONAL: fallback from Supabase photo_url ----------
      if (!photoBase64 && details.photo_url) {
        try {
          const resp = await fetch(details.photo_url);
          if (!resp.ok) throw new Error('Supabase fetch failed');
          const arrayBuf = await resp.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          const meta = await sharp(buf).metadata();
          if (meta.format === 'jpeg') {
            photoBase64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
          }
        } catch (e) {
          console.warn('Fallback photo failed:', e.message);
        }
      }
    const htmlContent = template({ ...escapedDetails, photo: photoBase64 });

    // const htmlContent = template({ ...escapedDetails, photo: photoBase64 });

    // executablePath: `chrome/mac_arm-140.0.7339.80/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
    const browser = await puppeteer.launch({
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

    await browser.close();

    res.status(200).json({
      message: 'Resume preview generated',
      previewUrl: `https://dalla-production.up.railway.app/temp/resume-${sessionId}.pdf`,
      tempPdfPath: pdfPath,
      sessionId,
    });
    // res.status(200).json({
    //   message: 'Resume preview generated',
    //   previewUrl: `http://localhost:3001/temp/resume-${sessionId}.pdf`,
    //   tempPdfPath: pdfPath,
    //   sessionId,
    // });

  } catch (error) {
    console.error('Error generating resume:', error.message);
    res.status(500).json({ error: `Failed to generate resume: ${error.message}` });
  }
});

// Serve temp files
app.get('/temp/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'temp', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }else{
      fs.unlink(filePath).catch(console.error);//delete after serving.
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});