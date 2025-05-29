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

    // Validate and escape details (simplified for brevity)
    const escapedDetails = {
      name: escapeLatex(details.name),
      // Add other fields as needed
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
${
  photo
    ? `\\includegraphics[width=3cm,height=3cm]{profile.jpg}`
    : ''
}
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

    // Set up LaTeX compilation with correct working directory
    const output = fs.createWriteStream(pdfPath);
    const latexProcess = latex(latexContent, {
      cmd: 'xelatex',
      cwd: tempDir, // Ensure LaTeX runs in tempDir
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

    // Read the generated PDF
    const pdfBuffer = await fsPromises.readFile(pdfPath);

    // Upload to Google Drive (simplified)
    const fileMetadata = { name: `resume-${resumeId}.pdf` };
    const media = { mimeType: 'application/pdf', body: fs.createReadStream(pdfPath) };
    const { data } = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    const resumeLink = data.webViewLink;

    // Clean up (commented out for debugging)
    // await fsPromises.unlink(texFilePath);
    // if (photoPath) await fsPromises.unlink(photoPath);
    // await fsPromises.unlink(pdfPath);

    return NextResponse.json({ message: 'Resume generated successfully', resumeLink }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  }
}