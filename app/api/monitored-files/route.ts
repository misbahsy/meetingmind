import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MONITORED_FOLDER = path.join(process.cwd(), 'public', 'monitored');

export async function GET() {
  try {
    // Ensure the monitored folder exists
    if (!fs.existsSync(MONITORED_FOLDER)) {
      fs.mkdirSync(MONITORED_FOLDER, { recursive: true });
    }

    // Read files from the monitored folder
    const files = fs.readdirSync(MONITORED_FOLDER);

    // Get file details
    const fileDetails = files.map(file => {
      const filePath = path.join(MONITORED_FOLDER, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
    });

    return NextResponse.json(fileDetails);
  } catch (error) {
    console.error('Error reading monitored folder:', error);
    return NextResponse.json({ error: 'Failed to read monitored folder' }, { status: 500 });
  }
}