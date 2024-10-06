# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# package.json

```json
{
  "name": "meeting-notes",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "axios": "^1.4.0",
    "clsx": "^2.1.1",
    "fluent-ffmpeg": "^2.1.3",
    "framer-motion": "^11.11.1",
    "lucide-react": "^0.447.0",
    "next": "14.2.14",
    "react": "^18",
    "react-dom": "^18",
    "react-mic": "^12.4.6",
    "tailwind-merge": "^2.5.3"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.14",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# .eslintrc.json

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}

```

# app/page.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, FileAudio, Brain, Clock, CheckCircle } from 'lucide-react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mic className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">MeetingMind</span>
        </div>
        <nav>
          <Link href="/dashboard" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Try It Now
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-20 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            Transform Your Meetings with AI
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-blue-200"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Capture, analyze, and act on your meeting insights effortlessly
          </motion.p>
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/dashboard" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
              Get Started
            </Link>
          </motion.div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileAudio, title: "Upload Audio", description: "Simply upload your meeting recording" },
              { icon: Brain, title: "AI Analysis", description: "Our AI processes and extracts key information" },
              { icon: CheckCircle, title: "Get Insights", description: "Review tasks, decisions, and action items" }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-black to-blue-800 p-6 rounded-lg text-center border border-blue-500"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <step.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2 text-blue-200">{step.title}</h3>
                <p className="text-blue-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Save Time", description: "Automatically extract key information from your meetings" },
              { title: "Increase Productivity", description: "Focus on action items and decisions, not note-taking" },
              { title: "Never Miss a Detail", description: "Capture every important point with AI-powered analysis" },
              { title: "Easy Collaboration", description: "Share meeting insights with your team effortlessly" }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-black to-blue-800 p-6 rounded-lg border border-blue-500"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <h3 className="text-xl font-semibold mb-2 text-blue-200">{benefit.title}</h3>
                <p className="text-blue-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-black py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-blue-300">
          <p>&copy; 2024 MeetingMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
```

# app/layout.tsx

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

```

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

```

# app/favicon.ico

This is a binary file of the type: Binary

# lib/utils.tsx

```tsx
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

# public/uploads/2024-10-01 Council Meeting(1).mp4

This is a binary file of the type: Binary

# public/uploads/2024-07-17-Council-Meeting.mp3

This is a binary file of the type: Binary

# app/fonts/GeistVF.woff

This is a binary file of the type: Binary

# app/fonts/GeistMonoVF.woff

This is a binary file of the type: Binary

# app/components/Dashboard.tsx

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AudioUploader from './AudioUploader';
import BentoGrid from './BentoGrid';
import { Mic } from 'lucide-react';

type DashboardProps = {
  data: any;
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [transcriptionData, setTranscriptionData] = React.useState<any>(null);

  const handleTranscription = (newData: any) => {
    setTranscriptionData(newData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-purple-900 text-white">
      <header className="bg-gradient-to-br from-purple-800 to-indigo-800 shadow-2xl border-b-2 border-purple-500">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Mic className="w-8 h-8 text-purple-300 mr-3" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Meeting Insights
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl p-6 border-2 border-purple-500"
        >
          <AudioUploader onTranscription={handleTranscription} />
        </motion.div>
        {transcriptionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Meeting Analysis
            </h2>
            <BentoGrid data={transcriptionData} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
```

# app/components/BentoGrid.tsx

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flag, AlertCircle, Mic, Calendar, Users, List, AlertTriangle } from 'lucide-react';


const CategoryCard: React.FC<{ title: string; items: any[] }> = ({ title, items }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 shadow-lg rounded-xl p-4 border border-purple-500">
      <h2 className="text-xl font-bold mb-2 text-purple-300">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-400">No items available.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const renderItem = () => {
              switch (title) {
                case 'Tasks':
                  return (
                    <>
                      <strong className="text-pink-400">Task:</strong> {item.task} <br />
                      <strong className="text-pink-400">Priority:</strong> {item.priority} <br />
                      <strong className="text-pink-400">Owner:</strong> {item.owner} <br />
                      <strong className="text-pink-400">Due Date:</strong> {item.due_date}
                    </>
                  );
                case 'Decisions':
                  return (
                    <>
                      <strong className="text-pink-400">Decision:</strong> {item.decision} <br />
                      <strong className="text-pink-400">Details:</strong> {item.details}
                    </>
                  );
                case 'Questions':
                  return (
                    <>
                      <strong className="text-pink-400">Question:</strong> {item.question} <br />
                      <strong className="text-pink-400">Status:</strong> {item.status} <br />
                      <strong className="text-pink-400">Answer:</strong> {item.answer}
                    </>
                  );
                case 'Insights':
                  return (
                    <>
                      <strong className="text-pink-400">Insight:</strong> {item.insight}
                    </>
                  );
                case 'Deadlines':
                  return (
                    <>
                      <strong className="text-pink-400">Deadline:</strong> {item.deadline} <br />
                      <strong className="text-pink-400">Due Date:</strong> {item.due_date}
                    </>
                  );
                case 'Attendees':
                  return (
                    <>
                      <strong className="text-pink-400">Name:</strong> {item.name} <br />
                      <strong className="text-pink-400">Role:</strong> {item.role}
                    </>
                  );
                case 'Follow-ups':
                  return (
                    <>
                      <strong className="text-pink-400">Follow-up:</strong> {item.follow_up} <br />
                      <strong className="text-pink-400">Owner:</strong> {item.owner} <br />
                      <strong className="text-pink-400">Due Date:</strong> {item.due_date}
                    </>
                  );
                case 'Risks':
                  return (
                    <>
                      <strong className="text-pink-400">Risk:</strong> {item.risk} <br />
                      <strong className="text-pink-400">Impact:</strong> {item.impact}
                    </>
                  );
                case 'Agenda':
                  return item;
                default:
                  return 'Undefined Category';
              }
            };
            return (
              <li key={index} className="bg-opacity-20 bg-purple-700 p-2 rounded-lg text-purple-100">
                {renderItem()}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const BentoGrid: React.FC<{ data: any }> = ({ data }) => {
  const gridItems = [
    { title: 'Tasks', icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Decisions', icon: Flag, color: 'bg-blue-500' },
    { title: 'Questions', icon: AlertCircle, color: 'bg-yellow-500' },
    { title: 'Insights', icon: Mic, color: 'bg-purple-500' },
    { title: 'Deadlines', icon: Calendar, color: 'bg-red-500' },
    { title: 'Attendees', icon: Users, color: 'bg-indigo-500' },
    { title: 'Follow-ups', icon: List, color: 'bg-pink-500' },
    { title: 'Risks', icon: AlertTriangle, color: 'bg-orange-500' },
  ];

  let parsedData;
  
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing data:', error);
      return null;
    }
  } else {
    parsedData = data;
  }

  console.log(parsedData);
  if (!parsedData || !parsedData.Breakdown) {
    console.error('Invalid data structure');
    return null;
  }

  const breakdown = parsedData.Breakdown;
  const categories = {
    Tasks: breakdown.Tasks || [],
    Decisions: breakdown.Decisions || [],
    Questions: breakdown.Questions || [],
    Insights: breakdown.Insights || [],
    Deadlines: breakdown.Deadlines || [],
    Attendees: breakdown.Attendees || [],
    'Follow-ups': breakdown['Follow-ups'] || [],
    Risks: breakdown.Risks || [],
    Agenda: breakdown.Agenda || [],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-black to-purple-900">
      {gridItems.map((item, index) => (
        <motion.div
          key={item.title}
          className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className={`p-4 ${item.color} bg-opacity-50`}>
            <item.icon className="w-8 h-8 text-white" />
          </div>
          <div className="p-4">
            <CategoryCard title={item.title} items={categories[item.title as keyof typeof categories]} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BentoGrid;
```

# app/components/AudioUploader.tsx

```tsx
'use client';

import React, { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const AudioUploader: React.FC<{ onTranscription: (data: any) => void }> = ({ onTranscription }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setSelectedFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an audio file.');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      formData.append('fullPath', selectedFile.name);

      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      onTranscription(response.data);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('There was an error processing your audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`p-8 border-2 border-dashed rounded-lg text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
        id="audio-file"
      />
      <label htmlFor="audio-file" className="cursor-pointer">
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg mb-2">
            {selectedFile ? selectedFile.name : 'Drag & drop your audio file here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">Supported formats: MP3, WAV, M4A</p>
        </div>
      </label>
      {selectedFile && (
        <button
          onClick={handleUpload}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Upload and Transcribe'}
        </button>
      )}
    </div>
  );
};

export default AudioUploader;
```

# app/components/AudioRecorder.tsx

```tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Dynamically import ReactMic with SSR disabled
const ReactMic = dynamic(() => import('react-mic').then((mod) => mod.ReactMic), {
  ssr: false,
});

const AudioRecorder: React.FC<{ onTranscription: (data: any) => void }> = ({ onTranscription }) => {
  const [record, setRecord] = useState(false);
  const [blobURL, setBlobURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onStop = async (recordedBlob: any) => {
    setBlobURL(recordedBlob.blobURL);
    await handleUpload(recordedBlob.blob);
  };

  const handleUpload = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.m4a');

      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onTranscription(response.data);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('There was an error processing your audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        stereo={false}
        mimeType="audio/m4a"
        echoCancellation={true}
        autoGainControl={true}
        noiseSuppression={true}
        channelCount={1}
      />
      <div className="flex gap-4">
        {!record ? (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={startRecording}
          >
            Start Recording
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        )}
      </div>
      {isProcessing && <p className="text-blue-500">Processing...</p>}
      {blobURL && (
        <div className="mt-4">
          <audio src={blobURL} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
```

# app/dashboard/page.tsx

```tsx
'use client';

import React from 'react';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <Dashboard data={null} />
  );
}
```

# app/api/transcribe/route.ts

```ts
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

    // Send POST request to the transcription API
    const apiResponse = await axios.post(
      'http://127.0.0.1:7860/api/v1/run/5781a690-e689-4b26-b636-45da76a91915',
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
```

