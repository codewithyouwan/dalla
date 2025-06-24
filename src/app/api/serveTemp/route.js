import { promises as fsPromises } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req) {
  console.log('Full request URL:', req.url); // Log full URL
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('path');
  console.log('Received path parameter:', fileName); // Debug log

  if (!fileName || typeof fileName !== 'string' || fileName.includes('..') || !fileName.endsWith('.pdf')) {
    console.log('Validation failed for path:', fileName); // Debug log
    return NextResponse.json({ error: 'Invalid or missing file path', receivedUrl: req.url }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'temp', fileName);
  console.log('Attempting to serve file:', filePath); // Debug log

  try {
    const fileBuffer = await fsPromises.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error reading file:', error.message); // Debug log
    return NextResponse.json({ error: 'File not found', filePath }, { status: 404 });
  }
}