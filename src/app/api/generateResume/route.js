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

export async function POST(req) {
  let texFilePath, pdfPath, photoPath, logPath;
  try {
    const formData = await req.formData();
    const details = JSON.parse(formData.get('details') || '{}');
    const photo = formData.get('photo');
    const sessionId = formData.get('sessionId') || uuidv4();

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

    const tempDir = path.join(process.cwd(), 'temp');
    await fsPromises.mkdir(tempDir, { recursive: true });
    texFilePath = path.join(tempDir, `resume-${sessionId}.tex`);
    pdfPath = path.join(tempDir, `resume-${sessionId}.pdf`);
    logPath = path.join(tempDir, `resume-${sessionId}.log`);

    // Delete existing PDF for this session, if any
    try {
      if (await fsPromises.access(pdfPath).then(() => true).catch(() => false)) {
        await fsPromises.unlink(pdfPath);
      }
    } catch (deleteError) {
      console.warn('Failed to delete existing PDF:', deleteError.message);
    }

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
          try {
            const logContent = await fsPromises.readFile(logPath, 'utf8');
            console.error('LaTeX log:', logContent);
            reject(new Error(`LaTeX compilation failed: ${latexError}\nLog: ${logContent}`));
          } catch (err) {
            console.error('Log file error:', err.message);
            reject(new Error(`LaTeX compilation failed: ${latexError}\nLog file not found at ${logPath}`));
          }
        } else {
          resolve();
        }
      });
      output.on('error', (err) => {
        console.error('Output error:', err.message);
        reject(err);
      });
      latexProcess.on('error', (err) => {
        console.error('LaTeX error:', err.message);
        reject(new Error(`LaTeX compilation failed: ${err.message}`));
      });
    });

    const previewUrl = `resume-${sessionId}.pdf`;
    return NextResponse.json({
      message: 'Resume preview generated',
      previewUrl,
      tempPdfPath: pdfPath,
      sessionId,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error.message);
    return NextResponse.json({ error: `Failed to generate resume: ${error.message}` }, { status: 500 });
  } finally {
    console.log('Cleaning up temporary files...');
    try {
      if (photoPath) await fsPromises.unlink(photoPath);
      if (texFilePath) await fsPromises.unlink(texFilePath);
      if (logPath && await fsPromises.access(logPath).then(() => true).catch(() => false)) {
        await fsPromises.unlink(logPath);
      }
      console.log('Temporary files (.tex, .jpg, .log) deleted');
    } catch (err) {
      console.warn('Cleanup failed:', err.message);
    }
  }
}