import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');
    console.log('Received path parameter:', filePath);

    if (!filePath || !filePath.startsWith('resume-') || !filePath.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'temp', filePath);
    console.log('Attempting to serve file:', fullPath);

    await fs.access(fullPath); // Check if file exists
    const fileBuffer = await fs.readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filePath}"`,
      },
    });
  } catch (error) {
    console.error('Error reading file:', error.message);
    return NextResponse.json({ error: `File not found: ${error.message}` }, { status: 404 });
  }
}