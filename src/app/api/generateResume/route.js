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

    // Log incoming details for debugging
    console.log('Received details:', JSON.stringify(details, null, 2));

    // Validate and escape details
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
      japaneseLevel: escapeLatex(details.japaneseLevel),
      selectedSuggestion: escapeLatex(details.selectedSuggestion),
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

    // Minimal LaTeX content for testing
    const latexContent = `
\\documentclass{article}
\\usepackage{xeCJK}
\\usepackage{graphicx}
\\usepackage[margin=1in]{geometry}
\\setCJKmainfont{Arial Unicode MS}
\\begin{document}
Hello, ${escapedDetails.name || 'World'}!
${photo ? `\\includegraphics[width=3cm,height=3cm]{profile.jpg}` : ''}
\\end{document}
    `;

    // Write the .tex file
    await fsPromises.writeFile(texFilePath, latexContent);

    // Handle photo if provided
    let photoPath;
    if (photo) {
      photoPath = path.join(tempDir, 'profile.jpg');
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      await fsPromises.writeFile(photoPath, photoBuffer);
    }

    // Generate PDF
    const output = fs.createWriteStream(pdfPath);
    const latexProcess = latex(latexContent, {
      cmd: 'xelatex',
      cwd: tempDir, // Ensure LaTeX runs in tempDir
      passes: 1, // Single pass for simplicity
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
          resolve();
        }
      });
      output.on('error', reject);
      latexProcess.on('error', (err) => {
        console.error('LaTeX output:', latexOutput);
        reject(new Error(`LaTeX compilation failed: ${err.message}`));
      });
    });

    // Upload to Google Drive
    const fileMetadata = {
      name: `resume-${escapedDetails.name || 'unnamed'}-${resumeId}.pdf`,
      parents: ['11XGFyJ5EOwbF9uvU91syjzOCFewHQfCY'], // Hardcode for testing
    };
    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(pdfPath),
    };
    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink',
    }).catch((err) => {
      console.error('Google Drive upload error:', err);
      throw new Error(`Failed to upload to Google Drive: ${err.message}`);
    });

    const resumeLink = driveResponse.data.webViewLink;

    // Insert into Supabase
    const { error } = await supabase.from('resumes').insert([
      {
        resume_id: uuidv4(),
        name: escapedDetails.name || 'Unnamed',
        resume_link: resumeLink,
      },
    ]);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Clean up (commented for debugging)
    // await fsPromises.unlink(texFilePath);
    // if (photoPath) await fsPromises.unlink(photoPath);
    // await fsPromises.unlink(pdfPath);

    return NextResponse.json({ message: 'Resume generated successfully', resumeLink }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  }
}