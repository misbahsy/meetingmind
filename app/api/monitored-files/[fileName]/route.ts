import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MONITORED_FOLDER = path.join(process.cwd(), 'public', 'monitored');

export async function GET(request: NextRequest, { params }: { params: { fileName: string } }) {
  const fileName = params.fileName;
  const filePath = path.join(MONITORED_FOLDER, fileName);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileType = path.extname(fileName).slice(1);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': `audio/${fileType}`,
        'Content-Disposition': `attachment; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}