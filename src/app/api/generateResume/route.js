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

    console.log('Received details:', JSON.stringify(details, null, 2));

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
        ? details.education.slice(0, 4).map((edu) => ({
            year: escapeLatex(edu.year),
            institution: escapeLatex(edu.institution),
            degree: escapeLatex(edu.degree),
          }))
        : [{ year: '未入力', institution: '未入力', degree: '未入力' }],
      interestFields: Array.isArray(details.interestFields)
        ? details.interestFields.map(escapeLatex).slice(0, 3).concat(Array(3).fill('未入力')).slice(0, 3)
        : ['未入力', '未入力', '未入力'],
      careerPriorities: Array.isArray(details.careerPriorities)
        ? details.careerPriorities.map(escapeLatex).slice(0, 3).concat(Array(3).fill('未入力')).slice(0, 3)
        : ['未入力', '未入力', '未入力'],
    };

    const resumeId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp');
    await fsPromises.mkdir(tempDir, { recursive: true });
    texFilePath = path.join(tempDir, `resume-${resumeId}.tex`);
    pdfPath = path.join(tempDir, `resume-${resumeId}.pdf`);
    logPath = path.join(tempDir, `resume-${resumeId}.log`);

    const templatePath = path.join(process.cwd(), 'src', 'app', 'helper', 'latexTemplate.tex');
    let latexContent;
    try {
      latexContent = await fsPromises.readFile(templatePath, 'utf8');
      console.log('Template loaded successfully from:', templatePath);
    } catch (err) {
      console.error('Template read error:', err);
      throw new Error(`Failed to read LaTeX template: ${err.message}`);
    }

    // Handle photo
    if (photo) {
      photoPath = path.join(tempDir, `profile-${resumeId}.jpg`);
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      if (!photoBuffer.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
        throw new Error('Invalid JPEG image provided');
      }
      if (photoBuffer.length > 5 * 1024 * 1024) {
        throw new Error('Photo exceeds 5MB limit');
      }
      await fsPromises.writeFile(photoPath, photoBuffer);
      console.log('Photo saved to:', photoPath);
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
      .replace('{japanCompanyInterest}', '*')
      .replace('{japanCompanySkills}', '.')
      .replace('{careerPriorities}', escapedDetails.careerPriorities.join(', '))
      .replace('{careerRoles}', escapedDetails.careerRoles)
      .replace('{japaneseLevel}', escapedDetails.japaneseLevel)
      .replace('{personality}', escapedDetails.personality);

    // Replace education placeholders
    for (let i = 0; i < 4; i++) {
      const edu = escapedDetails.education[i] || { year: '未入力', institution: '未入力', degree: '未入力' };
      latexContent = latexContent
        .replace(`{educationYear${i + 1}}`, edu.year)
        .replace(`{educationInstitution${i + 1}}`, edu.institution)
        .replace(`{educationDegree${i + 1}}`, edu.degree);
    }

    console.log('Generated LaTeX content preview:', latexContent.substring(0, 500));

    console.log('Writing LaTeX file to:', texFilePath);
    await fsPromises.writeFile(texFilePath, latexContent);

    console.log('Starting LaTeX compilation...');
    const output = fs.createWriteStream(pdfPath);
    const latexProcess = latex(latexContent, {
      cmd: 'xelatex',
      cwd: tempDir,
      passes: 2,
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
          } catch (err) {
            console.error('Log file err:', err.message);
            reject(new Error(`LaTeX compilation failed: ${latexError}\nLog file not found at ${logPath}`));
          }
        } else {
          console.log('LaTeX compilation completed successfully');
          resolve();
        }
      });
      output.on('error', (err) => {
        console.error('Output error:', err);
        reject(err);
      });
      latexProcess.on('error', (err) => {
        console.error('LaTeX error:', latexOutput);
        reject(new Error(`LaTeX compilation failed: ${err.message}`));
      });
    });

    console.log('Uploading PDF to Google Drive...');
    const fileMetadata = {
      name: `${escapedDetails.employeeNumber || 'unnamed'}_${escapedDetails.name || 'unnamed'}.pdf`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || '11XGFyJ5EOwbF9uvUplsyJZocFewHQfCY'],
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
    const newFileId = driveResponse.data.id;
    console.log('Uploaded to Google Drive:', resumeLink);

    console.log('Checking for existing user in Supabase...');
    const { data: existingUser, error: fetchError } = await supabase
      .from('resumes')
      .select('resume_id, resume_link')
      .eq('name', escapedDetails.name)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase fetch error:', fetchError);
      throw new Error(`Failed to fetch user: ${fetchError.message}`);
    }

    if (existingUser) {
      console.log('Existing user found, deleting old resume...');
      const oldFileIdMatch = existingUser.resume_link.match(/\/file\/d\/([^/]+)/);
      const oldFileId = oldFileIdMatch ? oldFileIdMatch[1] : null;

      if (oldFileId) {
        console.log('Deleting old resume from Google Drive:', oldFileId);
        try {
          await drive.files.delete({ fileId: oldFileId });
          console.log('Old resume deleted');
        } catch (err) {
          console.error('Failed to delete old resume:', err.message);
          throw new Error(`Failed to delete old resume: ${err.message}`);
        }
      } else {
        console.warn('No valid file ID for old resume, proceeding');
      }

      console.log('Updating resume in Supabase...');
      const { error: updateError } = await supabase
        .from('resumes')
        .update({ resume_link: resumeLink, updated_at: new Date().toISOString() })
        .eq('resume_id', existingUser.resume_id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Failed to update resume: ${updateError.message}`);
      }
      console.log('Resume updated in Supabase');
    } else {
      console.log('No existing user, inserting new entry...');
      const { error: insertError } = await supabase.from('resumes').insert([
        {
          resume_id: uuidv4(),
          name: escapedDetails.name || 'Unnamed',
          resume_link: resumeLink,
        },
      ]);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Failed to insert resume: ${insertError.message}`);
      }
      console.log('Resume inserted into Supabase');
    }

    console.log('Cleaning up temporary files...');
    try {
      if (photoPath) {
        await fsPromises.unlink(photoPath);
        console.log('Deleted photo:', photoPath);
      }
      await fsPromises.unlink(texFilePath);
      await fsPromises.unlink(pdfPath);
      console.log('Deleted LaTeX and PDF files');
    } catch (err) {
      console.warn('Cleanup failed:', err);
    }

    return NextResponse.json({ message: 'Resume generated successfully', resumeLink }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  } finally {
    console.log('Cleaning up...');
    try {
      if (photoPath) await fsPromises.unlink(photoPath);
      if (texFilePath) await fsPromises.unlink(texFilePath);
      if (pdfPath) await fsPromises.unlink(pdfPath);
      console.log('Temporary files deleted');
    } catch (err) {
      console.warn('Cleanup failed:', err.message);
    }
  }
}