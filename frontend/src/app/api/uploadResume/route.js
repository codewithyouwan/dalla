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
  let texFilePath, pdfPath, photoPath, logPath;
  try {
    const formData = await req.formData();
    const details = JSON.parse(formData.get('details') || '{}');
    const photo = formData.get('photo');
    const tempPdfPath = formData.get('tempPdfPath');
    const sessionId = formData.get('sessionId') || uuidv4();

    let finalPdfPath;
    if (tempPdfPath && (await fsPromises.access(tempPdfPath).then(() => true).catch(() => false))) {
      finalPdfPath = tempPdfPath;
    } else {
      // Generate new PDF
      const escapedDetails = {
        employeeNumber: escapeLatex(details.employeeNumber),
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
      texFilePath = path.join(tempDir, `resume-${sessionId}.tex`);
      pdfPath = path.join(tempDir, `resume-${sessionId}.pdf`);
      logPath = path.join(tempDir, `resume-${sessionId}.log`);
      finalPdfPath = pdfPath;

      const templatePath = path.join(process.cwd(), 'src', 'app', 'helper', 'latexTemplate.tex');
      let latexContent = await fsPromises.readFile(templatePath, 'utf8');

      // Handle photo
      if (photo) {
        photoPath = path.join(tempDir, `profile-${sessionId}.jpg`);
        const photoBuffer = Buffer.from(await photo.arrayBuffer());
        if (!photoBuffer.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
          throw new Error('Invalid JPEG image provided');
        }
        if (photoBuffer.length > 5 * 1024 * 1024) {
          throw new Error('Photo exceeds 5MB limit');
        }
        await fsPromises.writeFile(photoPath, photoBuffer);
        const latexPhotoPath = photoPath.replace(/\\/g, '/');
        latexContent = latexContent.replace(
          '{photo}',
          `\\includegraphics[width=3.5cm,height=4.5cm,keepaspectratio]{${latexPhotoPath}}`
        );
      } else {
        latexContent = latexContent.replace('{photo}', '');
      }

      latexContent = latexContent
        .replace('{employeeNumber}', escapedDetails.employeeNumber)
        .replace(/{name}/g, escapedDetails.name)
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

      const educationEntries = escapedDetails.education
        .map((edu, index) => {
          const multirowPrefix = index === 0 
            ? `\\multirow{${escapedDetails.education.length}}{*}{\\textbf{学歴}}`
            : '';
          return `${multirowPrefix} & ${edu.year} & ${edu.institution} & ${edu.degree} \\\\ \\hline`;
        })
        .join('\n');
      latexContent = latexContent.replace('{education}', educationEntries);

      await fsPromises.writeFile(texFilePath, latexContent);

      const output = fs.createWriteStream(pdfPath);
      const latexProcess = latex(latexContent, {
        cmd: 'xelatex',
        cwd: tempDir,
        passes: 2,
      });

      let latexError = '';
      latexProcess.on('error', (err) => {
        latexError = err.message;
      });

      latexProcess.pipe(output);

      await new Promise((resolve, reject) => {
        output.on('finish', async () => {
          if (latexError) {
            const logContent = await fsPromises.readFile(logPath, 'utf8');
            reject(new Error(`LaTeX compilation failed: ${latexError}\nLog: ${logContent}`));
          } else {
            resolve();
          }
        });
        output.on('error', (err) => {
          reject(err);
        });
        latexProcess.on('error', (err) => {
          reject(new Error(`LaTeX compilation failed: ${err.message}`));
        });
      });
    }

    // Upload to Google Drive
    const fileMetadata = {
      name: `resume-${details.name || 'unnamed'}-${uuidv4()}.pdf`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || '11XGFyJ5EOwbF9uvU91syjzOCFewHQfCY'],
    };
    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(finalPdfPath),
    };
    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    // Set permissions to anyone with the link
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const resumeLink = driveResponse.data.webViewLink;
    const newFileId = driveResponse.data.id;

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('resumes')
      .select('resume_id, resume_link')
      .eq('name', details.name || 'Unnamed')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing user: ${fetchError.message}`);
    }

    if (existingUser) {
      const oldFileIdMatch = existingUser.resume_link.match(/\/file\/d\/([^/]+)/);
      const oldFileId = oldFileIdMatch ? oldFileIdMatch[1] : null;

      if (oldFileId) {
        try {
          await drive.files.delete({ fileId: oldFileId });
        } catch (deleteError) {
          console.warn('Failed to delete old resume:', deleteError.message);
        }
      }

      const { error: updateError } = await supabase
        .from('resumes')
        .update({ resume_link: resumeLink, updated_at: new Date().toISOString() })
        .eq('resume_id', existingUser.resume_id);

      if (updateError) {
        throw new Error(`Failed to update resume: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabase.from('resumes').insert([
        {
          resume_id: uuidv4(),
          name: details.name || 'Unnamed',
          resume_link: resumeLink,
        },
      ]);

      if (insertError) {
        throw new Error(`Failed to insert resume: ${insertError.message}`);
      }
    }

    return NextResponse.json({ message: 'Resume saved successfully', resumeLink }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to save resume: ${error.message}` }, { status: 500 });
  } finally {
    try {
      if (photoPath) await fsPromises.unlink(photoPath);
      if (texFilePath) await fsPromises.unlink(texFilePath);
      if (logPath) await fsPromises.unlink(logPath);
      // Keep finalPdfPath if it was from tempPdfPath, as it’s managed by the session
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError.message);
    }
  }
}