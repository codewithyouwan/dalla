import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req, { params }) {
  const sessionId = params.sessionId;
  const pdfPath = path.join('/tmp/resume_temp', `resume-${sessionId}.pdf`);

  try {
    const pdfBuffer = await fs.readFile(pdfPath);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=resume-${sessionId}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error serving resume:', error.message, error.stack);
    return NextResponse.json({ error: `Failed to serve resume: ${error.message}` }, { status: 404 });
  }
}