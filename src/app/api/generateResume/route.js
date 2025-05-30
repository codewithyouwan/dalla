import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import latex from 'node-latex';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

// Function to escape special LaTeX characters
const escapeLatex = (str) => {
  if (typeof str !== 'string') return str || '未入力';
  return str
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\\/g, '\\textbackslash{}');
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize Google Drive client
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(Buffer.from(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64, 'base64').toString()),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const details = JSON.parse(formData.get('details') || '{}');
    const photo = formData.get('photo');

    console.log('Received details:', JSON.stringify(details, null, 2));

    const escapedDetails = {
      name: escapeLatex(details.name),
      devField: escapeLatex(details.devField),
      jobType: escapeLatex(details.jobType),
      domain: escapeLatex(details.domain),
      type: escapeLatex(details.type),
      languages: escapeLatex(details.languages),
      devTools: escapeLatex(details.devTools),
      projectRole: escapeLatex(details.projectRole),
      projectDescription: escapeLatex(details.projectDescription),
      projectChallenges: escapeLatex(details.projectChallenges),
      leadership: escapeLatex(details.leadership),
      productDevReason: escapeLatex(details.productDevReason),
      productDevRole: escapeLatex(details.productDevRole),
      interestDetails: escapeLatex(details.interestDetails),
      japanCompanyInterest: escapeLatex(details.japanCompanyInterest),
      japanCompanySkills: escapeLatex(details.japanCompanySkills),
      careerRoles: escapeLatex(details.careerRoles),
      japaneseLevel: escapeLatex(details.japaneseLevel || details.selectedSuggestion),
      personality: escapeLatex(details.personality),
      education: Array.isArray(details.education)
        ? details.education.map((edu) => ({
            year: escapeLatex(edu.year),
            institution: escapeLatex(edu.institution),
            degree: escapeLatex(edu.degree),
          }))
        : [{ year: '未入力', institution: '未入力', degree: '未入力' }],
      interestFields: Array.isArray(details.interestFields)
        ? details.interestFields.map(escapeLatex)
        : ['未入力', '未入力', '未入力'],
      careerPriorities: Array.isArray(details.careerPriorities)
        ? details.careerPriorities.map(escapeLatex)
        : ['未入力', '未入力', '未入力'],
    };

    const resumeId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp');
    await fsPromises.mkdir(tempDir, { recursive: true });
    const texFilePath = path.join(tempDir, `resume-${resumeId}.tex`);
    const pdfPath = path.join(tempDir, `resume-${resumeId}.pdf`);
    const logPath = path.join(tempDir, `resume-${resumeId}.log`);

    const templatePath = path.join(process.cwd(), 'src', 'app', 'helper', 'latexTemplate.tex');
    let latexContent;
    try {
      latexContent = await fsPromises.readFile(templatePath, 'utf8');
      console.log('Template loaded successfully from:', templatePath);
    } catch (err) {
      console.error('Template read error:', err);
      throw new Error(`Failed to read LaTeX template: ${err.message}`);
    }

    latexContent = latexContent
      .replace('{name}', escapedDetails.name)
      .replace('{photo}', photo ? '\\includegraphics[width=3cm,height=3cm]{profile.jpg}' : '')
      .replace('{devField}', escapedDetails.devField)
      .replace('{jobType}', escapedDetails.jobType)
      .replace('{domain}', escapedDetails.domain)
      .replace('{type}', escapedDetails.type)
      .replace('{languages}', escapedDetails.languages)
      .replace('{devTools}', escapedDetails.devTools)
      .replace('{projectRole}', escapedDetails.projectRole)
      .replace('{projectDescription}', escapedDetails.projectDescription)
      .replace('{projectChallenges}', escapedDetails.projectChallenges)
      .replace('{leadership}', escapedDetails.leadership)
      .replace('{productDevReason}', escapedDetails.productDevReason)
      .replace('{productDevRole}', escapedDetails.productDevRole)
      .replace('{interestFields}', escapedDetails.interestFields.join(' \\hspace{2cm} '))
      .replace('{interestDetails}', escapedDetails.interestDetails)
      .replace('{japanCompanyInterest}', escapedDetails.japanCompanyInterest)
      .replace('{japanCompanySkills}', escapedDetails.japanCompanySkills)
      .replace('{careerPriorities}', escapedDetails.careerPriorities.join(', '))
      .replace('{careerRoles}', escapedDetails.careerRoles)
      .replace('{japaneseLevel}', escapedDetails.japaneseLevel)
      .replace('{personality}', escapedDetails.personality);

    // Generate education entries with proper row termination
    const educationEntries = escapedDetails.education
      .map((edu, index) => {
        const multirowPrefix = index === 0 
          ? `\\multirow{${escapedDetails.education.length}}{*}{\\textbf{学歴}}` 
          : '';
        return `${multirowPrefix} & ${edu.year} & ${edu.institution} & ${edu.degree} \\\\ \\hline`;
      })
      .join('\n');
    latexContent = latexContent.replace('{education}', educationEntries);

    // Add debugging
    console.log('Final LaTeX content:', latexContent);

    console.log('Writing LaTeX file to:', texFilePath);
    await fsPromises.writeFile(texFilePath, latexContent);

    let photoPath;
    if (photo) {
      photoPath = path.join(tempDir, 'profile.jpg');
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      await fsPromises.writeFile(photoPath, photoBuffer);
      console.log('Photo saved to:', photoPath);
    }

    console.log('Starting LaTeX compilation...');
    const output = fs.createWriteStream(pdfPath);
    const latexProcess = latex(latexContent, {
      cmd: 'xelatex',
      cwd: tempDir,
      passes: 1,
    });

    let latexError = '';
    let latexOutput = '';
    latexProcess.on('data', (data) => {
      latexOutput += data.toString();
    });
    latexProcess.on('error', (err) => {
      latexError = err.message;
    });

    latexProcess.pipe(output);

    await new Promise((resolve, reject) => {
      output.on('finish', async () => {
        if (latexError) {
          try {
            const logContent = await fsPromises.readFile(logPath, 'utf8');
            console.error('LaTeX log:', logContent);
            reject(new Error(`LaTeX compilation failed: ${latexError}\nLog: ${logContent}`));
          } catch (logErr) {
            console.error('Log file error:', logErr.message);
            reject(new Error(`LaTeX compilation failed: ${latexError}\nLog file not found at ${logPath}`));
          }
        } else {
          console.log('LaTeX compilation completed successfully');
          resolve();
        }
      });
      output.on('error', (err) => {
        console.error('Output stream error:', err);
        reject(err);
      });
      latexProcess.on('error', (err) => {
        console.error('LaTeX output:', latexOutput);
        reject(new Error(`LaTeX compilation failed: ${err.message}`));
      });
    });

    console.log('Uploading PDF to Google Drive...');
    const fileMetadata = {
      name: `resume-${escapedDetails.name || 'unnamed'}-${resumeId}.pdf`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || '11XGFyJ5EOwbF9uvU91syjzOCFewHQfCY'],
    };
    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(pdfPath),
    };
    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    const resumeLink = driveResponse.data.webViewLink;
    console.log('Uploaded to Google Drive:', resumeLink);

    console.log('Inserting into Supabase...');
    const { error } = await supabase.from('resumes').insert([
      {
        resume_id: uuidv4(),
        name: escapedDetails.name || 'Unnamed',
        resume_link: resumeLink,
      },
    ]);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({ message: 'Resume generated successfully', resumeLink }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  }
}