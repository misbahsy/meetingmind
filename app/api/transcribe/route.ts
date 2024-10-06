import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const fullPath = formData.get('fullPath') as string;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Define directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save the file
    const filePath = path.join(uploadsDir, file.name);
    fs.writeFileSync(filePath, buffer);

    // Prepare JSON payload
    const payload = {
      output_type: "text",
      input_type: "text",
      tweaks: {
        "GroqWhisperComponent-Lep46": {
          audio_file: filePath // Use the full path of the saved file
        },
        "Prompt-8rDKv": {},
        "GroqModel-ybzSL": {},
        "ParseJSONData-AySVD": {},
        "TextInput-5MmdW": {}
      }
    };

    // Get the API URL from the environment variable
    const apiUrl = process.env.LANGFLOW_FLOW_URL;

    if (!apiUrl) {
      throw new Error('LANGFLOW_FLOW_URL is not defined in the environment variables');
    }

    // Send POST request to the transcription API
    const apiResponse = await axios.post(
      apiUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(apiResponse.data.outputs[0].outputs[0].messages[0].message);
    return NextResponse.json(apiResponse.data.outputs[0].outputs[0].messages[0].message, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred during processing.' }, { status: 500 });
  }
};