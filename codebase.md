# .eslintrc.json

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}

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
# .env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# app/api/meetings/[id]/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        rawTranscript: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          select: {
            id: true,
            task: true,
            owner: true,
            dueDate: true,
          },
        },
        decisions: {
          select: {
            id: true,
            decision: true,
            date: true,
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
            status: true,
            answer: true,
          },
        },
        insights: {
          select: {
            id: true,
            insight: true,
            reference: true,
          },
        },
        deadlines: {
          select: {
            id: true,
            description: true,
            dueDate: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        followUps: {
          select: {
            id: true,
            description: true,
            owner: true,
          },
        },
        risks: {
          select: {
            id: true,
            risk: true,
            impact: true,
          },
        },
        agenda: {
          select: {
            id: true,
            item: true,
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found.' }, { status: 404 })
    }

    const formattedMeeting = {
      name: meeting.name,
      description: meeting.description,
      transcript: meeting.rawTranscript,
      summary: meeting.summary,
      breakdown: {
        Tasks: meeting.tasks.map((task: { task: any; owner: any; dueDate: any }) => ({ task: task.task, owner: task.owner, due_date: task.dueDate })),
        Decisions: meeting.decisions.map((decision: { decision: any; date: any }) => ({ decision: decision.decision, date: decision.date })),
        Questions: meeting.questions.map((question: { question: any; status: any; answer: any }) => ({ question: question.question, status: question.status, answer: question.answer })),
        Insights: meeting.insights.map((insight: { insight: any; reference: any }) => ({ insight: insight.insight, reference: insight.reference })),
        Deadlines: meeting.deadlines.map((deadline: { description: any; dueDate: any }) => ({ description: deadline.description, due_date: deadline.dueDate })),
        Attendees: meeting.attendees.map((attendee: { name: any; role: any }) => ({ name: attendee.name, role: attendee.role })),
        "Follow-ups": meeting.followUps.map((followUp: { description: any; owner: any }) => ({ description: followUp.description, owner: followUp.owner })),
        Risks: meeting.risks.map((risk: { risk: any; impact: any }) => ({ risk: risk.risk, impact: risk.impact })),
        Agenda: meeting.agenda.map((item: { item: any }) => ({ item: item.item })),
      },
    }
    console.log(formattedMeeting)
    return NextResponse.json(formattedMeeting, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch meeting details.' }, { status: 500 })
  }
}

```

# app/api/meetings/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const GET = async () => {
  try {
    const meetings = await prisma.meeting.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        rawTranscript: true,
        summary: true,
        tasks: {
          select: {
            id: true,
            task: true,
            owner: true,
            dueDate: true,
          },
        },
        decisions: {
          select: {
            id: true,
            decision: true,
            date: true,
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
            status: true,
            answer: true,
          },
        },
        insights: {
          select: {
            id: true,
            insight: true,
            reference: true,
          },
        },
        deadlines: {
          select: {
            id: true,
            description: true,
            dueDate: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        followUps: {
          select: {
            id: true,
            description: true,
            owner: true,
          },
        },
        risks: {
          select: {
            id: true,
            risk: true,
            impact: true,
          },
        },
        agenda: {
          select: {
            id: true,
            item: true,
          },
        },
      },
    })

    return NextResponse.json(meetings, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch meetings.' }, { status: 500 })
  }
}

```

# app/api/transcribe/route.ts

```ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export const POST = async (request: NextRequest) => {
  try {
    console.log('Received POST request to /api/transcribe')
    const formData = await request.formData()
    const file = formData.get('audio') as File
    const fullPath = formData.get('fullPath') as string

    console.log('Received file:', file?.name)
    console.log('Full path:', fullPath)

    if (!file) {
      console.error('No audio file provided')
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Define directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Save the file
    const fileName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadsDir, fileName)
    fs.writeFileSync(filePath, buffer)

    console.log('File saved at:', filePath)

    // Get the API URL from the environment variable
    const apiUrl = process.env.LANGFLOW_FLOW_URL

    if (!apiUrl) {
      throw new Error('LANGFLOW_FLOW_URL is not defined in the environment variables')
    }

    // Prepare JSON payload
    const payload = {
      output_type: 'text',
      input_type: 'text',
      tweaks: {
        'GroqWhisperComponent-Lep46': {
          audio_file: filePath // Use the full path of the saved file
        },         
      }
    }

    console.log('Sending request to API:', apiUrl)

    // Send POST request to the transcription API
    const apiResponse = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Received response from API')
    
    // Ensure the response has the expected structure
    if (!apiResponse.data || !apiResponse.data.outputs) {
      throw new Error('Invalid API response structure.')
    }

    const { outputs } = apiResponse.data
    const analyzedTranscript = outputs[0]?.outputs[0]?.results?.breakdown?.text
    const rawTranscript = outputs[0]?.outputs[1]?.results?.transcription?.text

    if (!analyzedTranscript || !rawTranscript) {
      throw new Error('Invalid API response structure.')
    }
    console.log('Analyzed transcript:', analyzedTranscript.substring(0, 100) + '...')
    console.log('Raw transcript:', rawTranscript.substring(0, 100) + '...')

    // Parse JSON strings
    let analyzedData
    try {
      analyzedData = JSON.parse(analyzedTranscript)
    } catch (parseError) {
      throw new Error('Failed to parse analyzed transcript JSON.')
    }

    const rawData = rawTranscript
    console.log('Analyzed Data:', JSON.stringify(analyzedData, null, 2))
    console.log('Saving to database...')

    // Helper function to format dates as ISO strings
    const formatDate = (date: string) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null
    }

    // Save to database with safe access
    const meeting = await prisma.meeting.create({
      data: {
        name: analyzedData['Meeting Name'] || 'Untitled Meeting',
        description: analyzedData['Description'] || 'No description provided.',
        rawTranscript: rawData,
        summary: analyzedData['Summary'] || '',
        tasks: {
          create: (analyzedData['Tasks'] || [])
            .filter((task: any) => task && typeof task === 'object')
            .map((task: any) => ({
              task: task.description || 'No task description',
              owner: task.owner || 'Unassigned',
              dueDate: task.due_date ? formatDate(task.due_date) : null,
            })),
        },
        decisions: {
          create: (analyzedData['Decisions'] || [])
            .filter((decision: any) => decision && typeof decision === 'object')
            .map((decision: any) => ({
              decision: decision.description || 'No decision description',
              date: decision.date ? formatDate(decision.date) : new Date().toISOString(),
            })),
        },
        questions: {
          create: (analyzedData['Questions'] || [])
            .filter((question: any) => question && typeof question === 'object')
            .map((question: any) => ({
              question: question.question || 'No question',
              status: question.status || 'Unanswered',
              answer: question.answer || '',
            })),
        },
        insights: {
          create: (analyzedData['Insights'] || [])
            .filter((insight: any) => insight && typeof insight === 'object')
            .map((insight: any) => ({
              insight: insight.insight || 'No insight',
              reference: insight.reference || '',
            })),
        },
        deadlines: {
          create: (analyzedData['Deadlines'] || [])
            .filter((deadline: any) => deadline && typeof deadline === 'object')
            .map((deadline: any) => ({
              description: deadline.description || 'No deadline description',
              dueDate: deadline.date ? formatDate(deadline.date) : null,
            })),
        },
        attendees: {
          create: (analyzedData['Attendees'] || [])
            .filter((attendee: any) => attendee && typeof attendee === 'object')
            .map((attendee: any) => ({
              name: attendee.name || 'Unnamed Attendee',
              role: attendee.role || 'No role specified',
            })),
        },
        followUps: {
          create: (analyzedData['Follow-ups'] || [])
            .filter((followUp: any) => followUp && typeof followUp === 'object')
            .map((followUp: any) => ({
              description: followUp.description || 'No follow-up description',
              owner: followUp.owner || 'Unassigned',
            })),
        },
        risks: {
          create: (analyzedData['Risks'] || [])
            .filter((risk: any) => risk && typeof risk === 'object')
            .map((risk: any) => ({
              risk: risk.risk || 'No risk description',
              impact: risk.impact || 'No impact specified',
            })),
        },
        agenda: {
          create: (analyzedData['Agenda'] || [])
            .filter((item: any) => item && typeof item === 'string')
            .map((item: string) => ({
              item: item,
            })),
        },
      },
      include: {
        tasks: true,
        decisions: true,
        questions: true,
        insights: true,
        deadlines: true,
        attendees: true,
        followUps: true,
        risks: true,
        agenda: true,
      },
    })

    console.log('Meeting saved successfully:', meeting.id)

    return NextResponse.json(meeting, { status: 200 })
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error)
    return NextResponse.json({ error: 'An error occurred during processing.' }, { status: 500 })
  }
}
```

# app/dashboard/meeting/[id]/page.tsx

```tsx
'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MeetingDetails from "@/components/MeetingDetails";

interface MeetingData {
  name: string;
  description: string;
  transcript: string;
  summary: string;
  breakdown: {
    Tasks: { task: string; owner: string; due_date: string }[];
    Decisions: { decision: string; details: string }[];
    Questions: { question: string; status: string; answer?: string }[];
    Insights: { insight: string; reference: string }[];
    Deadlines: { deadline: string; related_to: string }[];
    Attendees: { name: string; role: string }[];
    "Follow-ups": { follow_up: string; owner: string; due_date: string }[];
    Risks: { risk: string; impact: string }[];
  };
}
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const [data, setData] = useState<MeetingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching meeting details for ID:", meetingId);
    if (meetingId) {
      axios
        .get(`/api/meetings/${meetingId}`)
        .then((response) => {
          console.log("Received meeting data:", response.data);
          setData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching meeting details:", error);
          if (error.response && error.response.status === 404) {
            setError("Meeting not found.");
          } else {
            setError("Failed to fetch meeting details.");
          }
        });
    }
  }, [meetingId]);

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <button onClick={handleGoBack} className="mb-4 flex items-center text-purple-500 hover:text-purple-700">
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </button>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <button onClick={handleGoBack} className="mb-4 flex items-center text-purple-500 hover:text-purple-700">
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </button>
        Loading...
      </div>
    );
  }

  console.log("Rendering MeetingDetails with data:", data);
  return (
    <div className="container mx-auto p-6">
      <button onClick={handleGoBack} className="mb-4 flex items-center text-purple-500 hover:text-purple-700">
        <ArrowLeft className="mr-2" size={20} />
        Back to Dashboard
      </button>
      <MeetingDetails data={data} />
    </div>
  );
}

```

# app/dashboard/page.tsx

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import UploadAudio from '@/components/UploadAudio';
import { useToast } from "@/hooks/use-toast"


interface Meeting {
  id: string;
  name: string;
  description: string;
  fileName: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { toast } = useToast();

  const fetchMeetings = async () => {
    try {
      const response = await axios.get("/api/meetings");
      setMeetings(response.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleViewDetails = (meetingId: string) => {
    router.push(`dashboard/meeting/${meetingId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-2xl font-semibold">Meeting Mind</h1>
      </header>
      <main className="container mx-auto p-6 space-y-6">
        <UploadAudio onUploadSuccess={fetchMeetings} />
        <Card>
          <CardHeader>
            <CardTitle>Previous Meetings</CardTitle>
            <CardDescription>Recent transcribed meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {meetings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>{meeting.name}</TableCell>
                      <TableCell>{meeting.description}</TableCell>
                      <TableCell>
                        <Button variant="outline" onClick={() => handleViewDetails(meeting.id)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No meetings found.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
```

# app/favicon.ico

This is a binary file of the type: Binary

# app/fonts/GeistMonoVF.woff

This is a binary file of the type: Binary

# app/fonts/GeistVF.woff

This is a binary file of the type: Binary

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

# app/layout.tsx

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
        <Toaster />
      </body>
    </html>
  );
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

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

# components/CategoryCard.tsx

```tsx
"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryItem {
  [key: string]: string
}

interface CategoryProps {
  title: string
  items: CategoryItem[]
  gridSpan?: string
}

const CategoryCard: React.FC<CategoryProps> = ({ title, items, gridSpan }) => {
  return (
    <Card className={`h-full ${gridSpan}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground">No items available.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="bg-muted p-2 rounded-md">
                  {Object.entries(item).map(([key, value]) => {
                    const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    let formattedValue = value;
                    if (key === 'due_date' && value.includes('T')) {
                      formattedValue = value.split('T')[0];
                    }
                    return (
                      <div key={key}>
                        <strong className="text-primary">{formattedKey}:</strong> {formattedValue}
                      </div>
                    );
                  })}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default CategoryCard

```

# components/MeetingDetails.tsx

```tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Flag,
  AlertCircle,
  Lightbulb,
  Calendar,
  Users,
  List,
  AlertTriangle,
  FileText,
} from "lucide-react"
import CategoryCard from "@/components/CategoryCard"

interface CategoryItem {
  [key: string]: string
}

interface MeetingDetailsProps {
  data: {
    name: string
    description: string
    transcript: string
    summary: string
    breakdown: {
      Tasks: { task: string; owner: string; due_date: string }[]
      Decisions: { decision: string; details: string }[]
      Questions: { question: string; status: string; answer?: string }[]
      Insights: { insight: string; reference: string }[]
      Deadlines: { deadline: string; related_to: string }[]
      Attendees: { name: string; role: string }[]
      "Follow-ups": { follow_up: string; owner: string; due_date: string }[]
      Risks: { risk: string; impact: string }[]
    }
  }
}

export default function MeetingDetails({ data }: MeetingDetailsProps) {
  const categories = [
    { title: "Tasks", icon: CheckCircle, items: data.breakdown.Tasks || [], gridSpan: "col-span-2" },
    { title: "Decisions", icon: Flag, items: data.breakdown.Decisions || [], gridSpan: "col-span-2" },
    { title: "Questions", icon: AlertCircle, items: data.breakdown.Questions || [], gridSpan: "col-span-2" },
    { title: "Insights", icon: Lightbulb, items: data.breakdown.Insights || [], gridSpan: "col-span-2" },
    { title: "Deadlines", icon: Calendar, items: data.breakdown.Deadlines || [], gridSpan: "col-span-1" },
    { title: "Attendees", icon: Users, items: data.breakdown.Attendees || [], gridSpan: "col-span-1" },
    { title: "Follow-ups", icon: List, items: data.breakdown["Follow-ups"] || [], gridSpan: "col-span-2" },
    { title: "Risks", icon: AlertTriangle, items: data.breakdown.Risks || [], gridSpan: "col-span-2" },
  ]

  return (
    <div className="container mx-auto p-6 bg-background">
      <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
      <p className="text-muted-foreground mb-6">{data.description}</p>
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{data.summary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Transcript</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <p>{data.transcript}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="details">
          <div className="grid grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                className={category.gridSpan}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CategoryCard
                  title={category.title}
                  items={category.items}
                  gridSpan={category.gridSpan}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

```

# components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

# components/ui/card.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

# components/ui/dropdown-menu.tsx

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

# components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

# components/ui/label.tsx

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

# components/ui/scroll-area.tsx

```tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

# components/ui/table.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```

# components/ui/tabs.tsx

```tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

# components/ui/toast.tsx

```tsx
"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

```

# components/ui/toaster.tsx

```tsx
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

```

# components/UploadAudio.tsx

```tsx
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

const UploadAudio: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCompressedFile(null);
    }
  };

  const loadFFmpeg = async () => {
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
  };

  const compressAudio = async () => {
    if (!selectedFile) return;
    setIsCompressing(true);
    try {
      await loadFFmpeg();
      await ffmpeg.writeFile('input_audio', await fetchFile(selectedFile));

      // Set target bitrate to reduce file size
      // Adjust parameters as needed
      await ffmpeg.exec([
        '-i',
        'input_audio',
        '-ar',
        '16000',
        '-ac',
        '1',
        '-b:a',
        '16k',
        'output_audio.mp3'
      ]);

      const data = await ffmpeg.readFile('output_audio.mp3');
      const compressedBlob = new Blob([data], { type: 'audio/mpeg' });
      const compressed = new File([compressedBlob], `compressed_${selectedFile.name}`, {
        type: 'audio/mpeg',
      });

      setCompressedFile(compressed);
      toast({
        title: 'Compression Successful',
        description: `File size reduced to ${(compressed.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    } catch (error) {
      console.error('Compression error:', error);
      toast({
        title: 'Compression Failed',
        description: 'An error occurred while compressing the audio.',
        variant: 'destructive',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleTranscribe = async () => {
    const fileToUpload = compressedFile || selectedFile;
    if (!fileToUpload) return;

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('audio', fileToUpload);
    formData.append('fullPath', fileToUpload.name);

    try {
      await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      toast({
        title: 'Transcription Started',
        description: 'Your audio is being transcribed.',
      });
      onUploadSuccess();
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: 'An error occurred while transcribing the audio.',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
      setSelectedFile(null);
      setCompressedFile(null);
    }
  };

  const getFileSizeMB = (file: File | null): number => {
    return file ? file.size / (1024 ** 2) : 0;
  };

  const isCompressionNeeded = selectedFile && getFileSizeMB(selectedFile) > 24;
  const isTranscribeDisabled =
    (selectedFile && getFileSizeMB(selectedFile) > 24 && (!compressedFile || getFileSizeMB(compressedFile) > 24)) ||
    isCompressing ||
    isTranscribing;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Audio</CardTitle>
        <CardDescription>Select an audio file to transcribe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Label htmlFor="audio-file">Audio File</Label>
          <Input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <p>Selected File: {selectedFile.name} ({getFileSizeMB(selectedFile).toFixed(2)} MB)</p>
          )}
          {isCompressionNeeded && (
            <Button onClick={compressAudio} disabled={isCompressing}>
              {isCompressing ? 'Compressing...' : 'Compress Audio'}
            </Button>
          )}
          {compressedFile && (
            <p>Compressed File: {compressedFile.name} ({getFileSizeMB(compressedFile).toFixed(2)} MB)</p>
          )}
          <Button onClick={handleTranscribe} disabled={isTranscribeDisabled}>
            {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
          </Button>
          {isTranscribeDisabled && (
            <p className="text-red-500">
              {selectedFile && getFileSizeMB(compressedFile || selectedFile) > 24
                ? 'File size exceeds 24 MB, please compress the file before transcribing.'
                : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadAudio;

```

# hooks/use-toast.ts

```ts
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

```

# lib/prisma.ts

```ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

# lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

# LICENSE

```
MIT License

Copyright (c) 2024 Misbah Syed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

```

# package.json

```json
{
  "name": "meeting-notes",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "prisma generate && next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@ffmpeg/ffmpeg": "^0.12.10",
    "@ffmpeg/util": "^0.12.1",
    "@prisma/client": "^5.20.0",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "axios": "^1.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "fluent-ffmpeg": "^2.1.3",
    "framer-motion": "^11.11.1",
    "lucide-react": "^0.447.0",
    "next": "14.2.14",
    "react": "^18",
    "react-dom": "^18",
    "react-mic": "^12.4.6",
    "sqlite3": "^5.1.7",
    "tailwind-merge": "^2.5.3",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.14",
    "postcss": "^8",
    "prisma": "^5.20.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
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

# prisma/dev.db

This is a binary file of the type: Binary

# prisma/migrations/20241009233612_init/migration.sql

```sql
-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rawTranscript" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decision" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Decision_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "answer" TEXT,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insight" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Insight_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deadline" TEXT NOT NULL,
    "relatedTo" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deadline_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendee_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followUp" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUp_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "risk" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Risk_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

```

# prisma/migrations/20241010010041_init/migration.sql

```sql
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deadline" TEXT,
    "relatedTo" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deadline_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deadline" ("createdAt", "deadline", "id", "meetingId", "relatedTo", "updatedAt") SELECT "createdAt", "deadline", "id", "meetingId", "relatedTo", "updatedAt" FROM "Deadline";
DROP TABLE "Deadline";
ALTER TABLE "new_Deadline" RENAME TO "Deadline";
CREATE TABLE "new_FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followUp" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TEXT,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUp_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FollowUp" ("createdAt", "dueDate", "followUp", "id", "meetingId", "owner", "updatedAt") SELECT "createdAt", "dueDate", "followUp", "id", "meetingId", "owner", "updatedAt" FROM "FollowUp";
DROP TABLE "FollowUp";
ALTER TABLE "new_FollowUp" RENAME TO "FollowUp";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

```

# prisma/migrations/20241010054943_init/migration.sql

```sql
/*
  Warnings:

  - You are about to drop the column `deadline` on the `Deadline` table. All the data in the column will be lost.
  - You are about to drop the column `relatedTo` on the `Deadline` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `Decision` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `FollowUp` table. All the data in the column will be lost.
  - You are about to drop the column `followUp` on the `FollowUp` table. All the data in the column will be lost.
  - You are about to alter the column `dueDate` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Added the required column `description` to the `Deadline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Decision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `FollowUp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgendaItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deadline_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deadline" ("createdAt", "id", "meetingId", "updatedAt") SELECT "createdAt", "id", "meetingId", "updatedAt" FROM "Deadline";
DROP TABLE "Deadline";
ALTER TABLE "new_Deadline" RENAME TO "Deadline";
CREATE TABLE "new_Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decision" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Decision_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Decision" ("createdAt", "decision", "id", "meetingId", "updatedAt") SELECT "createdAt", "decision", "id", "meetingId", "updatedAt" FROM "Decision";
DROP TABLE "Decision";
ALTER TABLE "new_Decision" RENAME TO "Decision";
CREATE TABLE "new_FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUp_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FollowUp" ("createdAt", "id", "meetingId", "owner", "updatedAt") SELECT "createdAt", "id", "meetingId", "owner", "updatedAt" FROM "FollowUp";
DROP TABLE "FollowUp";
ALTER TABLE "new_FollowUp" RENAME TO "FollowUp";
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" DATETIME,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "dueDate", "id", "meetingId", "owner", "task", "updatedAt") SELECT "createdAt", "dueDate", "id", "meetingId", "owner", "task", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

```

# prisma/migrations/migration_lock.toml

```toml
# Please do not edit this file manually
# It should be added in your version-control system (i.e. Git)
provider = "sqlite"
```

# prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Meeting {
  id            String      @id @default(uuid())
  name          String
  description   String
  rawTranscript String
  summary       String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  tasks         Task[]
  decisions     Decision[]
  questions     Question[]
  insights      Insight[]
  deadlines     Deadline[]
  attendees     Attendee[]
  followUps     FollowUp[]
  risks         Risk[]
  agenda        AgendaItem[]
}

model Task {
  id          String   @id @default(uuid())
  task        String
  owner       String
  dueDate     DateTime?
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Decision {
  id          String   @id @default(uuid())
  decision    String
  date        DateTime
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Question {
  id          String   @id @default(uuid())
  question    String
  status      String
  answer      String?
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Insight {
  id          String   @id @default(uuid())
  insight     String
  reference   String
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Deadline {
  id          String   @id @default(uuid())
  description String
  dueDate     DateTime?
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Attendee {
  id          String   @id @default(uuid())
  name        String
  role        String
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model FollowUp {
  id          String   @id @default(uuid())
  description String
  owner       String
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Risk {
  id          String   @id @default(uuid())
  risk        String
  impact      String
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model AgendaItem {
  id          String   @id @default(uuid())
  item        String
  meetingId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}
```

# public/dashboard.png

This is a binary file of the type: Image

# public/landing.webp

This is a binary file of the type: Image

# public/meeting_details.png

This is a binary file of the type: Image

# public/meeting_summary.png

This is a binary file of the type: Image

# README.md

```md
# Meeting Mind- An Hour Long Meeting Analyzed in Under 30 Seconds (Powered by Langflow)

MeetingMind is an AI-powered meeting assistant that helps you capture, analyze, and act on your meeting insights effortlessly. This project is built with Langflow, Next.js and Groq-based fast transcription service to analyze your meetings and generate insights.


## Demo

Check out this demo video to see MeetingMind in action:

https://github.com/user-attachments/assets/50a9de7a-b24f-4167-9526-4e112b1d24f8



## Features

- Audio recording and file upload
- AI-powered transcription
- Automatic extraction of key information:
  - Tasks
  - Decisions
  - Questions
  - Insights
  - Deadlines
  - Attendees
  - Follow-ups
  - Risks
  - Agenda

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- A LangFlow server running locally
- Git (for cloning the repository)

### Caution

⚠️ **Important:** Groq Whisper used for transcription and analysis, currently supports files up to 25 MB only. There is a compression step in the process to reduce the file size to a manageable level. If your audio file is still larger than 25 MB, you will need to compress it before uploading. This limitation may affect the processing of longer meetings or high-quality audio recordings.

To compress your audio files further, you can use tools like:
- Online audio compressors 
- FFmpeg (command-line tool for audio/video processing)

Ensure your compressed audio maintains sufficient quality for accurate transcription while staying under the 25 MB limit.

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/meetingmind.git
   cd meetingmind
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up LangFlow:
   - Install and run the LangFlow backend server
   - Upload the flow provided in the repo at `utils/langflow_flow/Meeting Mind.json`
   - Note the URL of your LangFlow server

4. Create a `.env.local` file in the root directory and add the LangFlow URL:
   \`\`\`
   LANGFLOW_FLOW_URL="http://127.0.0.1:7860/api/v1/run/5781a690-e689-4b26-b636-45da76a91915"
   \`\`\`
   Replace the URL with your actual LangFlow server URL if different.

   In the file `app/api/transcribe/route.ts`, locate the `payload` object and update the Groq component name to match your LangFlow component name. For example:

   \`\`\`typescript
   const payload = {
     output_type: 'text',
     input_type: 'text',
     tweaks: {
       'YourGroqComponentName': {
         audio_file: filePath
       },         
     }
   }
   \`\`\`

   Replace 'YourGroqComponentName' with the actual name of your Groq component in LangFlow.

5. Set up the database:

   This project uses Prisma as an ORM. By default, it's configured to use SQLite as the database.

   a. To use the local SQLite database:
      - Ensure your `.env` file contains:
        \`\`\`
        DATABASE_URL="file:./dev.db"
        \`\`\`
      - Run the following commands to set up your database:
        \`\`\`bash
        npx prisma generate
        npx prisma migrate dev --name init
        \`\`\`

   b. To use a different database (e.g., PostgreSQL with Neon):
      - Update your `.env` file with the appropriate connection string:
        \`\`\`
        DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
        \`\`\`
      - Update the `provider` in `prisma/schema.prisma`:
        \`\`\`prisma
        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }
        \`\`\`
      - Run the Prisma commands as mentioned above to generate the client and run migrations.

6. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Navigate to the dashboard page.
2. Upload an audio file.
3. Wait for the AI to process and analyze the meeting.
4. Review the extracted information in the Dashboard.

## Project Structure

- `app/`: Contains the main application code
  - `components/`: Reusable React components
  - `api/`: API routes for server-side functionality
  - `dashboard/`: Dashboard page component
  - `page.tsx`: Home page component
- `public/`: Static assets
- `prisma/`: Database schema and migrations
- `utils/`: Utility functions and configurations
- `lib/`: Shared libraries and modules

## Technologies Used

- Langflow: For AI workflow management
- Next.js: React framework for building the web application
- React: JavaScript library for building user interfaces
- Tailwind CSS: Utility-first CSS framework
- Framer Motion: Animation library for React
- Axios: Promise-based HTTP client
- Prisma: ORM for database management
- SQLite: Default database (can be changed to PostgreSQL or others)
- Groq: AI model provider for transcription and analysis

## Configuration

- The project uses environment variables for configuration. Ensure all necessary variables are set in your `.env.local` file.
- Tailwind CSS configuration can be found in `tailwind.config.ts`.
- TypeScript configuration is in `tsconfig.json`.

## API Routes

- `/api/meetings`: Handles CRUD operations for meetings
- `/api/transcribe`: Handles audio file transcription and analysis

## Debugging

- Use the browser's developer tools to debug client-side issues.
- For server-side debugging, use console.log statements or attach a debugger to your Node.js process.

## Performance Considerations

- Large audio files may take longer to process. Consider implementing a progress indicator for better user experience.
- Optimize database queries and indexes for improved performance as the number of meetings grows.

## Screenshots

### Landing Page
![Landing Page](public/landing.webp)

### Dashboard
![Dashboard](public/dashboard.png)

#### Meeting Summary
![Meeting Summary](public/meeting_summary.png)

#### Meeting Details
![Meeting Details](public/meeting_details.png)

These screenshots provide a visual representation of the application's main interfaces. The landing page showcases the initial user experience, while the dashboard displays the core functionality where users can upload audio files and view the AI-processed meeting information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Here are some ways you can contribute:

- Report bugs and issues
- Suggest new features
- Improve documentation
- Submit pull requests with bug fixes or new features

Please read our contributing guidelines before submitting a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

If you encounter any problems or have questions, please open an issue on the GitHub repository.

## Acknowledgements

- Thanks to the Langflow team for providing the AI workflow management tool.
- Special thanks to all contributors who have helped shape this project.

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

```

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

# utils/demo/MeetingMind.mp4

This is a binary file of the type: Binary

# utils/langflow_flow/Meeting Mind.json

```json
{"id":"5781a690-e689-4b26-b636-45da76a91915","data":{"nodes":[{"id":"GroqWhisperComponent-Lep46","type":"genericNode","position":{"x":-1483.4857952490108,"y":37.275916175740406},"data":{"type":"GroqWhisperComponent","node":{"template":{"_type":"Component","audio_file":{"trace_as_metadata":true,"file_path":"5781a690-e689-4b26-b636-45da76a91915/2024-10-09_11-04-49_test2.m4a","fileTypes":["mp3","mp4","m4a","wav","webm","m4b","mpga","mp2","flac"],"list":false,"required":false,"placeholder":"","show":true,"name":"audio_file","value":"","display_name":"Audio File","advanced":false,"dynamic":false,"info":"Supported file types: mp3, mp4, m4a, wav, webm, m4b, mpga, mp2, flac","title_case":false,"type":"file","_input_type":"FileInput"},"code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"from langflow.custom import Component\nfrom langflow.inputs import (\n    FileInput,\n    SecretStrInput,\n    DropdownInput,\n    StrInput,\n    FloatInput,\n)\nfrom langflow.io import BoolInput, IntInput, MessageTextInput\nfrom langflow.template import Output\nfrom langflow.schema.message import Message\nfrom groq import Groq\n\nclass GroqWhisperComponent(Component):\n    display_name = \"Groq Whisper\"\n    description = \"Audio to text with Whisper model using Groq API\"\n    icon = \"file-audio\"\n    inputs = [\n        SecretStrInput(\n            name=\"groq_api_key\",\n            display_name=\"Groq API Key\",\n            info=\"The Groq API Key to use for the Whisper model.\",\n            advanced=False,\n        ),\n        FileInput(\n            name=\"audio_file\",\n            display_name=\"Audio File\",\n            file_types=[\"mp3\", \"mp4\", \"m4a\", \"wav\", \"webm\", \"m4b\", \"mpga\", \"mp2\", \"flac\"],\n            info=\"Supported file types: mp3, mp4, m4a, wav, webm, m4b, mpga, mp2, flac\",\n        ),\n        DropdownInput(\n            name=\"model_name\",\n            display_name=\"Model\",\n            info=\"The name of the model to use.\",\n            options=[\"distil-whisper-large-v3-en\"],\n            value=\"distil-whisper-large-v3-en\",\n        ),\n        MessageTextInput(\n            name=\"prompt\",\n            display_name=\"Prompt\",\n            info=\"An optional text to guide the model's style or continue a previous audio segment.\",\n            advanced=True,\n            value=\"\",\n        ),\n        StrInput(\n            name=\"language\",\n            display_name=\"Language\",\n            info=\"The language of the input audio. Supplying the input language in ISO-639-1 format will improve accuracy and latency.\",\n            advanced=True,\n            value=\"\",\n        ),\n        FloatInput(\n            name=\"temperature\",\n            display_name=\"Temperature\",\n            info=\"The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.\",\n            advanced=True,\n            value=0.0,\n        ),\n    ]\n    outputs = [\n        Output(\n            display_name=\"Transcription\",\n            name=\"transcription\",\n            method=\"transcribe_audio\",\n        ),\n    ]\n\n    def transcribe_audio(self) -> Message:\n        client = Groq(api_key=self.groq_api_key)\n        with open(self.audio_file, \"rb\") as file:\n            transcription = client.audio.transcriptions.create(\n                model=self.model_name,\n                file=file,\n                prompt=self.prompt or None,\n                response_format=\"verbose_json\",\n                temperature=self.temperature or 0.0,\n                language=self.language or None\n            )\n            # print(transcription)\n            return Message(text=transcription.text)","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"groq_api_key":{"load_from_db":true,"required":false,"placeholder":"","show":true,"name":"groq_api_key","value":"","display_name":"Groq API Key","advanced":false,"input_types":["Message"],"dynamic":false,"info":"The Groq API Key to use for the Whisper model.","title_case":false,"password":true,"type":"str","_input_type":"SecretStrInput"},"language":{"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"language","value":"","display_name":"Language","advanced":true,"dynamic":false,"info":"The language of the input audio. Supplying the input language in ISO-639-1 format will improve accuracy and latency.","title_case":false,"type":"str","_input_type":"StrInput"},"model_name":{"trace_as_metadata":true,"options":["distil-whisper-large-v3-en"],"combobox":false,"required":false,"placeholder":"","show":true,"name":"model_name","value":"distil-whisper-large-v3-en","display_name":"Model","advanced":false,"dynamic":false,"info":"The name of the model to use.","title_case":false,"type":"str","_input_type":"DropdownInput"},"prompt":{"trace_as_input":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"prompt","value":"","display_name":"Prompt","advanced":true,"input_types":["Message"],"dynamic":false,"info":"An optional text to guide the model's style or continue a previous audio segment.","title_case":false,"type":"str","_input_type":"MessageTextInput"},"temperature":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"temperature","value":0,"display_name":"Temperature","advanced":true,"dynamic":false,"info":"The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.","title_case":false,"type":"float","_input_type":"FloatInput"}},"description":"Audio to text with Whisper model using Groq API","icon":"file-audio","base_classes":["Message"],"display_name":"Groq Whisper","documentation":"","custom_fields":{},"output_types":[],"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"transcription","display_name":"Transcription","method":"transcribe_audio","value":"__UNDEFINED__","cache":true}],"field_order":["groq_api_key","audio_file","model_name","prompt","language","temperature"],"beta":false,"edited":true,"lf_version":"1.0.18"},"id":"GroqWhisperComponent-Lep46"},"selected":true,"width":384,"height":502,"dragging":false,"positionAbsolute":{"x":-1483.4857952490108,"y":37.275916175740406}},{"id":"Prompt-8rDKv","type":"genericNode","position":{"x":-981.6329126277515,"y":-67.39310132366732},"data":{"type":"Prompt","node":{"template":{"_type":"Component","code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"from langflow.base.prompts.api_utils import process_prompt_template\nfrom langflow.custom import Component\nfrom langflow.inputs.inputs import DefaultPromptField\nfrom langflow.io import Output, PromptInput\nfrom langflow.schema.message import Message\nfrom langflow.template.utils import update_template_values\n\n\nclass PromptComponent(Component):\n    display_name: str = \"Prompt\"\n    description: str = \"Create a prompt template with dynamic variables.\"\n    icon = \"prompts\"\n    trace_type = \"prompt\"\n    name = \"Prompt\"\n\n    inputs = [\n        PromptInput(name=\"template\", display_name=\"Template\"),\n    ]\n\n    outputs = [\n        Output(display_name=\"Prompt Message\", name=\"prompt\", method=\"build_prompt\"),\n    ]\n\n    async def build_prompt(\n        self,\n    ) -> Message:\n        prompt = await Message.from_template_and_variables(**self._attributes)\n        self.status = prompt.text\n        return prompt\n\n    def _update_template(self, frontend_node: dict):\n        prompt_template = frontend_node[\"template\"][\"template\"][\"value\"]\n        custom_fields = frontend_node[\"custom_fields\"]\n        frontend_node_template = frontend_node[\"template\"]\n        _ = process_prompt_template(\n            template=prompt_template,\n            name=\"template\",\n            custom_fields=custom_fields,\n            frontend_node_template=frontend_node_template,\n        )\n        return frontend_node\n\n    def post_code_processing(self, new_frontend_node: dict, current_frontend_node: dict):\n        \"\"\"\n        This function is called after the code validation is done.\n        \"\"\"\n        frontend_node = super().post_code_processing(new_frontend_node, current_frontend_node)\n        template = frontend_node[\"template\"][\"template\"][\"value\"]\n        # Kept it duplicated for backwards compatibility\n        _ = process_prompt_template(\n            template=template,\n            name=\"template\",\n            custom_fields=frontend_node[\"custom_fields\"],\n            frontend_node_template=frontend_node[\"template\"],\n        )\n        # Now that template is updated, we need to grab any values that were set in the current_frontend_node\n        # and update the frontend_node with those values\n        update_template_values(new_template=frontend_node, previous_template=current_frontend_node[\"template\"])\n        return frontend_node\n\n    def _get_fallback_input(self, **kwargs):\n        return DefaultPromptField(**kwargs)\n","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"template":{"trace_as_input":true,"list":false,"required":false,"placeholder":"","show":true,"name":"template","value":"Based on the user transcription data you have access to, you need to produce a Breakdown of Categories:\n\nTasks: Tasks with varying priorities, owners, and due dates.\nExample task assignments include preparing reports, setting up meetings, and submitting proposals.\n\nDecisions: Important decisions made during the meeting\nDecisions include vendor choice, marketing strategy, and budget approval.\n\nQuestions: Questions raised during the meeting, with their status (answered/unanswered).\nAnswered questions include additional context in the form of answers.\n\nInsights: Insights based on the conversation, ranging from sales performance to concerns about deadlines.\nEach insight refer back to the exact part of the conversation.\n\nDeadlines: Upcoming deadlines related to the budget, product launch, and client presentation.\nThis helps track time-sensitive matters.\n\nAttendees: Attendees who attended the meeting\nThis tracks attendance and their respective roles.\n\nFollow-ups: Follow-up tasks assigned to individuals after the meeting, each with a due date.\nFollow-up items focus on clarifying budget, design, and scheduling next actions.\n\nRisks: Risks identified during the meeting, each with potential impacts on the project.\nThese include risks like budget overruns, delays, and potential staff turnover.\n\nAgenda: A list of the agenda items covered in the meeting.\nThe agenda provides a structured overview of the topics discussed. You need to extract as many items as you can, some might have 1-2 items, and some might 10, so make sure to capture every point.\n\nMeeting Name: The title of the meeting, reflecting its official designation. This gives a clear identifier for the meeting, often including a specific date or purpose, such as \"October 2024 Municipal Council Meeting.\"\n\nDescription: A high-level overview of the meeting’s purpose and key areas of focus. The description captures the essential topics discussed, decisions made, and the overall scope of the meeting, such as infrastructure updates, budget approvals, and key community concerns.\n\nSummary: A brief consolidation of the main points and outcomes from the meeting. The summary encapsulates the flow of the meeting, including major tasks, decisions, and action points, along with any significant challenges or risks highlighted, offering a concise review of the meeting’s results.\n\nYou must format your output as a JSON data, like:\n\n{output_example}\n\n\nThe transcript is as follow:\n\n{transcription}","display_name":"Template","advanced":false,"dynamic":false,"info":"","title_case":false,"type":"prompt","_input_type":"PromptInput"},"transcription":{"field_type":"str","required":false,"placeholder":"","list":false,"show":true,"multiline":true,"value":"","fileTypes":[],"file_path":"","name":"transcription","display_name":"transcription","advanced":false,"input_types":["Message","Text"],"dynamic":false,"info":"","load_from_db":false,"title_case":false,"type":"str"},"output_example":{"field_type":"str","required":false,"placeholder":"","list":false,"show":true,"multiline":true,"value":"","fileTypes":[],"file_path":"","name":"output_example","display_name":"output_example","advanced":false,"input_types":["Message","Text"],"dynamic":false,"info":"","load_from_db":false,"title_case":false,"type":"str"}},"description":"Create a prompt template with dynamic variables.","icon":"prompts","is_input":null,"is_output":null,"is_composition":null,"base_classes":["Message"],"name":"","display_name":"Prompt","documentation":"","custom_fields":{"template":["output_example","transcription"]},"output_types":[],"full_path":null,"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"prompt","hidden":null,"display_name":"Prompt Message","method":"build_prompt","value":"__UNDEFINED__","cache":true}],"field_order":["template"],"beta":false,"error":null,"edited":false},"id":"Prompt-8rDKv"},"selected":false,"width":384,"height":502,"positionAbsolute":{"x":-981.6329126277515,"y":-67.39310132366732},"dragging":false},{"id":"TextInput-5MmdW","type":"genericNode","position":{"x":-1517.9689142084346,"y":-332.4509973473767},"data":{"type":"TextInput","node":{"template":{"_type":"Component","code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"from langflow.base.io.text import TextComponent\nfrom langflow.io import MultilineInput, Output\nfrom langflow.schema.message import Message\n\n\nclass TextInputComponent(TextComponent):\n    display_name = \"Text Input\"\n    description = \"Get text inputs from the Playground.\"\n    icon = \"type\"\n    name = \"TextInput\"\n\n    inputs = [\n        MultilineInput(\n            name=\"input_value\",\n            display_name=\"Text\",\n            info=\"Text to be passed as input.\",\n        ),\n    ]\n    outputs = [\n        Output(display_name=\"Text\", name=\"text\", method=\"text_response\"),\n    ]\n\n    def text_response(self) -> Message:\n        message = Message(\n            text=self.input_value,\n        )\n        return message\n","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"input_value":{"trace_as_input":true,"multiline":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"input_value","value":"{\n  \"Breakdown\": {\n    \"tasks\": [\n      {\n        \"description\": \"Prepare a report on the status of the procedural bylaw 2410.\",\n        \"assigned_to\": \"CEO\",\n        \"priority\": \"High\"\n      },\n      {\n        \"description\": \"Follow up with the public works department regarding the tree asset projections.\",\n        \"assigned_to\": \"Nomar\",\n        \"priority\": \"Medium\"\n      },\n      {\n        \"description\": \"Gather names for the two vacant positions on the Northeast Red Watershed District Committee.\",\n        \"assigned_to\": \"Council Members\",\n        \"priority\": \"Medium\"\n      },\n      {\n        \"description\": \"Draft the policy changes for the new community grant system.\",\n        \"assigned_to\": \"Grants Officer\",\n        \"priority\": \"High\"\n      },\n      {\n        \"description\": \"Schedule a meeting with local business leaders to discuss economic growth initiatives.\",\n        \"assigned_to\": \"Economic Development Manager\",\n        \"priority\": \"Low\"\n      }\n    ],\n    \"decisions\": [\n      {\n        \"description\": \"The agenda for the meeting was approved unanimously.\"\n      },\n      {\n        \"description\": \"The council activity reports for September were received as information.\"\n      },\n      {\n        \"description\": \"The additional cost of $33,300 for the Settlers Road Bridge Crossing project will be included in the 2025 capital budget.\"\n      },\n      {\n        \"description\": \"Nonprofit organizations and community service groups will receive grants for 2024 as listed.\"\n      },\n      {\n        \"description\": \"The municipal recreation center expansion was approved with an amended budget.\"\n      },\n      {\n        \"description\": \"The council decided to allocate $15,000 for the local library digital resources upgrade.\"\n      }\n    ],\n    \"questions\": [\n      {\n        \"question\": \"What is the status of the procedural bylaw 2410?\",\n        \"raised_by\": \"Janet\",\n        \"status\": \"Unanswered\"\n      },\n      {\n        \"question\": \"Why are the costs for the Settlers Road Bridge Crossing project increasing?\",\n        \"raised_by\": \"Andy\",\n        \"status\": \"Answered\",\n        \"answer\": \"The costs are increasing due to unforeseen costs and additional decommissioning requirements for the existing infrastructure.\"\n      },\n      {\n        \"question\": \"What is the Society of Ivan Franco?\",\n        \"raised_by\": \"Mark\",\n        \"status\": \"Answered\",\n        \"answer\": \"It used to be an active community club located off Warren Hill Road, and discussions are ongoing about obtaining that land.\"\n      },\n      {\n        \"question\": \"When will the public works department complete the tree asset projections?\",\n        \"raised_by\": \"Councilor Miller\",\n        \"status\": \"Pending\"\n      },\n      {\n        \"question\": \"How is the council planning to address the growing number of emergency motor vehicle collisions?\",\n        \"raised_by\": \"Glenn\",\n        \"status\": \"Unanswered\"\n      }\n    ],\n    \"insights\": [\n      {\n        \"description\": \"The council is committed to supporting seniors' activities and improving lodging for seniors in the community.\",\n      },\n      {\n        \"description\": \"There is a need for a daycare center in the RM, and land has been identified for this purpose.\",\n      },\n      {\n        \"description\": \"The increase in emergency motor vehicle collisions is concerning and needs further investigation.\",\n      },\n      {\n        \"description\": \"Public interest in developing additional recreational trails continues to grow.\",\n      },\n      {\n        \"description\": \"The community expressed concerns about rising utility rates in the region.\",\n      }\n    ],\n    \"deadlines\": [\n      {\n        \"description\": \"Submit names for the two vacant positions on the Northeast Red Watershed District Committee.\",\n        \"date\": \"2024-10-15\"\n      },\n      {\n        \"description\": \"Prepare the report on the procedural bylaw 2410 for the next meeting.\",\n        \"date\": \"2024-10-15\"\n      },\n      {\n        \"description\": \"Submit the draft policy changes for the new community grant system.\",\n        \"date\": \"2024-11-01\"\n      },\n      {\n        \"description\": \"Submit the budget proposal for the library digital resources upgrade.\",\n        \"date\": \"2024-10-20\"\n      }\n    ],\n    \"attendees\": [\n      {\n        \"name\": \"Mr. Mayor\"\n      },\n      {\n        \"name\": \"Councilor Miller\"\n      },\n      {\n        \"name\": \"Councilor Fuels\"\n      },\n      {\n        \"name\": \"Councilor Kaczynski\"\n      },\n      {\n        \"name\": \"Councilor Warren\"\n      },\n      {\n        \"name\": \"Councilor Lee\"\n      },\n      {\n        \"name\": \"Mark\"\n      },\n      {\n        \"name\": \"Melinda\"\n      },\n      {\n        \"name\": \"Andy\"\n      },\n      {\n        \"name\": \"Glenn\"\n      },\n      {\n        \"name\": \"Janet\"\n      },\n      {\n        \"name\": \"Nomar\"\n      },\n      {\n        \"name\": \"Public Works Director\"\n      },\n      {\n        \"name\": \"Grants Officer\"\n      }\n    ],\n    \"follow_ups\": [\n      {\n        \"description\": \"Follow up with the finance team regarding the budget approval for the Settlers Road Bridge Crossing project.\",\n        \"owner\": \"CEO\",\n        \"due_date\": \"2024-10-18\"\n      },\n      {\n        \"description\": \"Prepare a detailed report on the emergency motor vehicle collisions for the next meeting.\",\n        \"owner\": \"Public Works Director\",\n        \"due_date\": \"2024-10-15\"\n      },\n      {\n        \"description\": \"Meet with the daycare development committee to review the proposed land options.\",\n        \"owner\": \"Planning Department\",\n        \"due_date\": \"2024-10-22\"\n      },\n      {\n        \"description\": \"Organize a public forum on recreational trail development.\",\n        \"owner\": \"Community Engagement Coordinator\",\n        \"due_date\": \"2024-10-30\"\n      }\n    ],\n    \"risks\": [\n      {\n        \"description\": \"There is a risk of budget overruns due to unforeseen costs in ongoing projects.\"\n      },\n      {\n        \"description\": \"Potential delays in the Settlers Road Bridge Crossing project could impact future budgets.\"\n      },\n      {\n        \"description\": \"A shortage of qualified contractors may delay the municipal recreation center expansion.\"\n      },\n      {\n        \"description\": \"Uncertainty around the future of federal infrastructure funding could affect long-term projects.\"\n      }\n    ],\n    \"agenda\": [\n      \"Invocation and land acknowledgement\",\n      \"Approval of the agenda\",\n      \"Adoption of the minutes from the previous meeting\",\n      \"Reports from council activities\",\n      \"Departmental reports\",\n      \"Question period\",\n      \"Consent agenda\",\n      \"Settlers Road Bridge Crossing project discussion\",\n      \"Northeast Red Watershed District Committee appointments\",\n      \"2024 nonprofit community grants discussion\",\n      \"Public forum planning for recreational trail development\",\n      \"2025 capital budget planning\",\n      \"Utility rate increase concerns\",\n      \"Closing of the meeting\"\n    ],\n   \"meeting_name\": \"October 2024 Municipal Council Meeting\",\n   \"description\": \"This meeting covered several key topics including updates on ongoing infrastructure projects, community grant allocations, and recreational development initiatives. Key decisions were made regarding the Settlers Road Bridge Crossing, the municipal recreation center expansion, and the allocation of funds for the local library's digital resources. Questions and concerns about rising utility rates and the growing number of emergency motor vehicle collisions were raised. Several tasks, follow-ups, and deadlines were established to address ongoing issues, and risks were identified for future project planning.\",\n   \"summary\": \"The meeting involved high-priority tasks such as preparing a procedural bylaw report, addressing public works follow-ups, and drafting policy changes for the community grant system. Key decisions included funding allocations for infrastructure projects and community services. Several questions were raised about project cost increases and emergency incidents, while the council focused on issues like recreational trail development and senior support. Insights indicated growing public concerns over utility rates, and various risks to project budgets and timelines were discussed.\"\n  }\n}\n\n","display_name":"Text","advanced":false,"input_types":["Message"],"dynamic":false,"info":"Text to be passed as input.","title_case":false,"type":"str","_input_type":"MultilineInput"}},"description":"Get text inputs from the Playground.","icon":"type","base_classes":["Message"],"display_name":"Format JSON Template of Tasks","documentation":"","custom_fields":{},"output_types":[],"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"text","display_name":"Text","method":"text_response","value":"__UNDEFINED__","cache":true}],"field_order":["input_value"],"beta":false,"edited":false,"lf_version":"1.0.18"},"id":"TextInput-5MmdW"},"selected":false,"width":384,"height":302,"positionAbsolute":{"x":-1517.9689142084346,"y":-332.4509973473767},"dragging":false},{"id":"OpenAIModel-iM892","type":"genericNode","position":{"x":-502.26482219657385,"y":369.9358469220685},"data":{"type":"OpenAIModel","node":{"template":{"_type":"Component","api_key":{"load_from_db":true,"required":false,"placeholder":"","show":true,"name":"api_key","value":"","display_name":"OpenAI API Key","advanced":false,"input_types":["Message"],"dynamic":false,"info":"The OpenAI API Key to use for the OpenAI model.","title_case":false,"password":true,"type":"str","_input_type":"SecretStrInput"},"code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"import operator\nfrom functools import reduce\n\nfrom langflow.field_typing.range_spec import RangeSpec\nfrom langchain_openai import ChatOpenAI\nfrom pydantic.v1 import SecretStr\n\nfrom langflow.base.models.model import LCModelComponent\nfrom langflow.base.models.openai_constants import OPENAI_MODEL_NAMES\nfrom langflow.field_typing import LanguageModel\nfrom langflow.inputs import (\n    BoolInput,\n    DictInput,\n    DropdownInput,\n    FloatInput,\n    IntInput,\n    SecretStrInput,\n    StrInput,\n)\n\n\nclass OpenAIModelComponent(LCModelComponent):\n    display_name = \"OpenAI\"\n    description = \"Generates text using OpenAI LLMs.\"\n    icon = \"OpenAI\"\n    name = \"OpenAIModel\"\n\n    inputs = LCModelComponent._base_inputs + [\n        IntInput(\n            name=\"max_tokens\",\n            display_name=\"Max Tokens\",\n            advanced=True,\n            info=\"The maximum number of tokens to generate. Set to 0 for unlimited tokens.\",\n            range_spec=RangeSpec(min=0, max=128000),\n        ),\n        DictInput(name=\"model_kwargs\", display_name=\"Model Kwargs\", advanced=True),\n        BoolInput(\n            name=\"json_mode\",\n            display_name=\"JSON Mode\",\n            advanced=True,\n            info=\"If True, it will output JSON regardless of passing a schema.\",\n        ),\n        DictInput(\n            name=\"output_schema\",\n            is_list=True,\n            display_name=\"Schema\",\n            advanced=True,\n            info=\"The schema for the Output of the model. You must pass the word JSON in the prompt. If left blank, JSON mode will be disabled.\",\n        ),\n        DropdownInput(\n            name=\"model_name\",\n            display_name=\"Model Name\",\n            advanced=False,\n            options=OPENAI_MODEL_NAMES,\n            value=OPENAI_MODEL_NAMES[0],\n        ),\n        StrInput(\n            name=\"openai_api_base\",\n            display_name=\"OpenAI API Base\",\n            advanced=True,\n            info=\"The base URL of the OpenAI API. Defaults to https://api.openai.com/v1. You can change this to use other APIs like JinaChat, LocalAI and Prem.\",\n        ),\n        SecretStrInput(\n            name=\"api_key\",\n            display_name=\"OpenAI API Key\",\n            info=\"The OpenAI API Key to use for the OpenAI model.\",\n            advanced=False,\n            value=\"OPENAI_API_KEY\",\n        ),\n        FloatInput(name=\"temperature\", display_name=\"Temperature\", value=0.1),\n        IntInput(\n            name=\"seed\",\n            display_name=\"Seed\",\n            info=\"The seed controls the reproducibility of the job.\",\n            advanced=True,\n            value=1,\n        ),\n    ]\n\n    def build_model(self) -> LanguageModel:  # type: ignore[type-var]\n        # self.output_schema is a list of dictionaries\n        # let's convert it to a dictionary\n        output_schema_dict: dict[str, str] = reduce(operator.ior, self.output_schema or {}, {})\n        openai_api_key = self.api_key\n        temperature = self.temperature\n        model_name: str = self.model_name\n        max_tokens = self.max_tokens\n        model_kwargs = self.model_kwargs or {}\n        openai_api_base = self.openai_api_base or \"https://api.openai.com/v1\"\n        json_mode = bool(output_schema_dict) or self.json_mode\n        seed = self.seed\n\n        if openai_api_key:\n            api_key = SecretStr(openai_api_key)\n        else:\n            api_key = None\n        output = ChatOpenAI(\n            max_tokens=max_tokens or None,\n            model_kwargs=model_kwargs,\n            model=model_name,\n            base_url=openai_api_base,\n            api_key=api_key,\n            temperature=temperature if temperature is not None else 0.1,\n            seed=seed,\n        )\n        if json_mode:\n            if output_schema_dict:\n                output = output.with_structured_output(schema=output_schema_dict, method=\"json_mode\")  # type: ignore\n            else:\n                output = output.bind(response_format={\"type\": \"json_object\"})  # type: ignore\n\n        return output  # type: ignore\n\n    def _get_exception_message(self, e: Exception):\n        \"\"\"\n        Get a message from an OpenAI exception.\n\n        Args:\n            exception (Exception): The exception to get the message from.\n\n        Returns:\n            str: The message from the exception.\n        \"\"\"\n\n        try:\n            from openai import BadRequestError\n        except ImportError:\n            return\n        if isinstance(e, BadRequestError):\n            message = e.body.get(\"message\")  # type: ignore\n            if message:\n                return message\n        return\n","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"input_value":{"trace_as_input":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"input_value","value":"","display_name":"Input","advanced":false,"input_types":["Message"],"dynamic":false,"info":"","title_case":false,"type":"str","_input_type":"MessageInput"},"json_mode":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"json_mode","value":true,"display_name":"JSON Mode","advanced":false,"dynamic":false,"info":"If True, it will output JSON regardless of passing a schema.","title_case":false,"type":"bool","_input_type":"BoolInput"},"max_tokens":{"trace_as_metadata":true,"range_spec":{"step_type":"float","min":0,"max":128000,"step":0.1},"list":false,"required":false,"placeholder":"","show":true,"name":"max_tokens","value":"","display_name":"Max Tokens","advanced":true,"dynamic":false,"info":"The maximum number of tokens to generate. Set to 0 for unlimited tokens.","title_case":false,"type":"int","_input_type":"IntInput"},"model_kwargs":{"trace_as_input":true,"list":false,"required":false,"placeholder":"","show":true,"name":"model_kwargs","value":{},"display_name":"Model Kwargs","advanced":true,"dynamic":false,"info":"","title_case":false,"type":"dict","_input_type":"DictInput"},"model_name":{"trace_as_metadata":true,"options":["gpt-4o-mini","gpt-4o","gpt-4-turbo","gpt-4-turbo-preview","gpt-4","gpt-3.5-turbo","gpt-3.5-turbo-0125"],"combobox":false,"required":false,"placeholder":"","show":true,"name":"model_name","value":"gpt-4o-mini","display_name":"Model Name","advanced":false,"dynamic":false,"info":"","title_case":false,"type":"str","_input_type":"DropdownInput"},"openai_api_base":{"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"openai_api_base","value":"","display_name":"OpenAI API Base","advanced":true,"dynamic":false,"info":"The base URL of the OpenAI API. Defaults to https://api.openai.com/v1. You can change this to use other APIs like JinaChat, LocalAI and Prem.","title_case":false,"type":"str","_input_type":"StrInput"},"output_schema":{"trace_as_input":true,"list":true,"required":false,"placeholder":"","show":true,"name":"output_schema","value":{},"display_name":"Schema","advanced":true,"dynamic":false,"info":"The schema for the Output of the model. You must pass the word JSON in the prompt. If left blank, JSON mode will be disabled.","title_case":false,"type":"dict","_input_type":"DictInput"},"seed":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"seed","value":1,"display_name":"Seed","advanced":true,"dynamic":false,"info":"The seed controls the reproducibility of the job.","title_case":false,"type":"int","_input_type":"IntInput"},"stream":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"stream","value":false,"display_name":"Stream","advanced":true,"dynamic":false,"info":"Stream the response from the model. Streaming works only in Chat.","title_case":false,"type":"bool","_input_type":"BoolInput"},"system_message":{"trace_as_input":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"system_message","value":"","display_name":"System Message","advanced":true,"input_types":["Message"],"dynamic":false,"info":"System message to pass to the model.","title_case":false,"type":"str","_input_type":"MessageTextInput"},"temperature":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"temperature","value":0.1,"display_name":"Temperature","advanced":false,"dynamic":false,"info":"","title_case":false,"type":"float","_input_type":"FloatInput"}},"description":"Generates text using OpenAI LLMs.","icon":"OpenAI","base_classes":["LanguageModel","Message"],"display_name":"OpenAI","documentation":"","custom_fields":{},"output_types":[],"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"text_output","display_name":"Text","method":"text_response","value":"__UNDEFINED__","cache":true},{"types":["LanguageModel"],"selected":"LanguageModel","name":"model_output","display_name":"Language Model","method":"build_model","value":"__UNDEFINED__","cache":true}],"field_order":["input_value","system_message","stream","max_tokens","model_kwargs","json_mode","output_schema","model_name","openai_api_base","api_key","temperature","seed"],"beta":false,"edited":false,"lf_version":"1.0.18"},"id":"OpenAIModel-iM892"},"selected":false,"width":384,"height":677,"positionAbsolute":{"x":-502.26482219657385,"y":369.9358469220685},"dragging":false},{"id":"JSONCleaner-dSEIi","type":"genericNode","position":{"x":93.51863880601047,"y":428.6163565103991},"data":{"type":"JSONCleaner","node":{"template":{"_type":"Component","code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"import json\nimport re\nimport unicodedata\nfrom langflow.custom import Component\nfrom langflow.inputs import MessageTextInput, BoolInput\nfrom langflow.template import Output\nfrom langflow.schema.message import Message\n\n\nclass JSONCleaner(Component):\n    display_name = \"JSON Cleaner\"\n    description = \"Cleans the messy and sometimes incorrect JSON strings produced by LLMs so that they are fully compliant with the JSON spec.\"\n    icon = \"custom_components\"\n\n    inputs = [\n        MessageTextInput(\n            name=\"json_str\", display_name=\"JSON String\", info=\"The JSON string to be cleaned.\", required=True\n        ),\n        BoolInput(\n            name=\"remove_control_chars\",\n            display_name=\"Remove Control Characters\",\n            info=\"Remove control characters from the JSON string.\",\n            required=False,\n        ),\n        BoolInput(\n            name=\"normalize_unicode\",\n            display_name=\"Normalize Unicode\",\n            info=\"Normalize Unicode characters in the JSON string.\",\n            required=False,\n        ),\n        BoolInput(\n            name=\"validate_json\",\n            display_name=\"Validate JSON\",\n            info=\"Validate the JSON string to ensure it is well-formed.\",\n            required=False,\n        ),\n    ]\n\n    outputs = [\n        Output(display_name=\"Cleaned JSON String\", name=\"output\", method=\"clean_json\"),\n    ]\n\n    def clean_json(self) -> Message:\n        try:\n            from json_repair import repair_json  # type: ignore\n        except ImportError:\n            raise ImportError(\n                \"Could not import the json_repair package.\" \"Please install it with `pip install json_repair`.\"\n            )\n\n        \"\"\"Clean the input JSON string based on provided options and return the cleaned JSON string.\"\"\"\n        json_str = self.json_str\n        remove_control_chars = self.remove_control_chars\n        normalize_unicode = self.normalize_unicode\n        validate_json = self.validate_json\n\n        try:\n            start = json_str.find(\"{\")\n            end = json_str.rfind(\"}\")\n            if start == -1 or end == -1:\n                raise ValueError(\"Invalid JSON string: Missing '{' or '}'\")\n            json_str = json_str[start : end + 1]\n\n            if remove_control_chars:\n                json_str = self._remove_control_characters(json_str)\n            if normalize_unicode:\n                json_str = self._normalize_unicode(json_str)\n            if validate_json:\n                json_str = self._validate_json(json_str)\n\n            cleaned_json_str = repair_json(json_str)\n            result = str(cleaned_json_str)\n\n            self.status = result\n            return Message(text=result)\n        except Exception as e:\n            raise ValueError(f\"Error cleaning JSON string: {str(e)}\")\n\n    def _remove_control_characters(self, s: str) -> str:\n        \"\"\"Remove control characters from the string.\"\"\"\n        return re.sub(r\"[\\x00-\\x1F\\x7F]\", \"\", s)\n\n    def _normalize_unicode(self, s: str) -> str:\n        \"\"\"Normalize Unicode characters in the string.\"\"\"\n        return unicodedata.normalize(\"NFC\", s)\n\n    def _validate_json(self, s: str) -> str:\n        \"\"\"Validate the JSON string.\"\"\"\n        try:\n            json.loads(s)\n            return s\n        except json.JSONDecodeError as e:\n            raise ValueError(f\"Invalid JSON string: {str(e)}\")\n","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"json_str":{"trace_as_input":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":true,"placeholder":"","show":true,"name":"json_str","value":"","display_name":"JSON String","advanced":false,"input_types":["Message"],"dynamic":false,"info":"The JSON string to be cleaned.","title_case":false,"type":"str","_input_type":"MessageTextInput"},"normalize_unicode":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"normalize_unicode","value":false,"display_name":"Normalize Unicode","advanced":false,"dynamic":false,"info":"Normalize Unicode characters in the JSON string.","title_case":false,"type":"bool","_input_type":"BoolInput"},"remove_control_chars":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"remove_control_chars","value":false,"display_name":"Remove Control Characters","advanced":false,"dynamic":false,"info":"Remove control characters from the JSON string.","title_case":false,"type":"bool","_input_type":"BoolInput"},"validate_json":{"trace_as_metadata":true,"list":false,"required":false,"placeholder":"","show":true,"name":"validate_json","value":true,"display_name":"Validate JSON","advanced":false,"dynamic":false,"info":"Validate the JSON string to ensure it is well-formed.","title_case":false,"type":"bool","_input_type":"BoolInput"}},"description":"Cleans the messy and sometimes incorrect JSON strings produced by LLMs so that they are fully compliant with the JSON spec.","icon":"custom_components","base_classes":["Message"],"display_name":"JSON Cleaner","documentation":"","custom_fields":{},"output_types":[],"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"output","display_name":"Cleaned JSON String","method":"clean_json","value":"__UNDEFINED__","cache":true}],"field_order":["json_str","remove_control_chars","normalize_unicode","validate_json"],"beta":false,"edited":false,"lf_version":"1.0.18"},"id":"JSONCleaner-dSEIi"},"selected":false,"width":384,"height":574,"positionAbsolute":{"x":93.51863880601047,"y":428.6163565103991},"dragging":false},{"id":"TextOutput-By44u","type":"genericNode","position":{"x":730.3183362631719,"y":684.803464364877},"data":{"type":"TextOutput","node":{"template":{"_type":"Component","code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"from langflow.base.io.text import TextComponent\nfrom langflow.io import MultilineInput, Output\nfrom langflow.schema.message import Message\n\n\nclass TextOutputComponent(TextComponent):\n    display_name = \"Text Output\"\n    description = \"Display a text output in the Playground.\"\n    icon = \"type\"\n    name = \"TextOutput\"\n\n    inputs = [\n        MultilineInput(\n            name=\"input_value\",\n            display_name=\"Text\",\n            info=\"Text to be passed as output.\",\n        ),\n    ]\n    outputs = [\n        Output(display_name=\"Text\", name=\"breakdown\", method=\"text_response\"),\n    ]\n\n    def text_response(self) -> Message:\n        message = Message(\n            text=self.input_value,\n        )\n        self.status = self.input_value\n        return message\n","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"input_value":{"trace_as_input":true,"multiline":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"input_value","value":"","display_name":"Text","advanced":false,"input_types":["Message"],"dynamic":false,"info":"Text to be passed as output.","title_case":false,"type":"str","_input_type":"MultilineInput"}},"description":"Display a text output in the Playground.","icon":"type","base_classes":["Message"],"display_name":"Text Output","documentation":"","custom_fields":{},"output_types":[],"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"breakdown","display_name":"Text","method":"text_response","value":"__UNDEFINED__","cache":true}],"field_order":["input_value"],"beta":false,"edited":true},"id":"TextOutput-By44u"},"selected":false,"width":384,"height":302,"positionAbsolute":{"x":730.3183362631719,"y":684.803464364877},"dragging":false},{"id":"TextOutput-V5ldV","type":"genericNode","position":{"x":-227.37117065217348,"y":1341.931192742318},"data":{"type":"TextOutput","node":{"template":{"_type":"Component","code":{"type":"code","required":true,"placeholder":"","list":false,"show":true,"multiline":true,"value":"from langflow.base.io.text import TextComponent\nfrom langflow.io import MultilineInput, Output\nfrom langflow.schema.message import Message\n\n\nclass TextOutputComponent(TextComponent):\n    display_name = \"Text Output\"\n    description = \"Display a text output in the Playground.\"\n    icon = \"type\"\n    name = \"TextOutput\"\n\n    inputs = [\n        MultilineInput(\n            name=\"input_value\",\n            display_name=\"Text\",\n            info=\"Text to be passed as output.\",\n        ),\n    ]\n    outputs = [\n        Output(display_name=\"Text\", name=\"transcription\", method=\"text_response\"),\n    ]\n\n    def text_response(self) -> Message:\n        message = Message(\n            text=self.input_value,\n        )\n        self.status = self.input_value\n        return message\n","fileTypes":[],"file_path":"","password":false,"name":"code","advanced":true,"dynamic":true,"info":"","load_from_db":false,"title_case":false},"input_value":{"trace_as_input":true,"multiline":true,"trace_as_metadata":true,"load_from_db":false,"list":false,"required":false,"placeholder":"","show":true,"name":"input_value","value":"","display_name":"Text","advanced":false,"input_types":["Message"],"dynamic":false,"info":"Text to be passed as output.","title_case":false,"type":"str","_input_type":"MultilineInput"}},"description":"Display a text output in the Playground.","icon":"type","base_classes":["Message"],"display_name":"Text Output","documentation":"","custom_fields":{},"output_types":[],"pinned":false,"conditional_paths":[],"frozen":false,"outputs":[{"types":["Message"],"selected":"Message","name":"transcription","display_name":"Text","method":"text_response","value":"__UNDEFINED__","cache":true}],"field_order":["input_value"],"beta":false,"edited":true},"id":"TextOutput-V5ldV"},"selected":false,"width":384,"height":302,"positionAbsolute":{"x":-227.37117065217348,"y":1341.931192742318},"dragging":false}],"edges":[{"source":"TextInput-5MmdW","sourceHandle":"{œdataTypeœ:œTextInputœ,œidœ:œTextInput-5MmdWœ,œnameœ:œtextœ,œoutput_typesœ:[œMessageœ]}","target":"Prompt-8rDKv","targetHandle":"{œfieldNameœ:œoutput_exampleœ,œidœ:œPrompt-8rDKvœ,œinputTypesœ:[œMessageœ,œTextœ],œtypeœ:œstrœ}","data":{"targetHandle":{"fieldName":"output_example","id":"Prompt-8rDKv","inputTypes":["Message","Text"],"type":"str"},"sourceHandle":{"dataType":"TextInput","id":"TextInput-5MmdW","name":"text","output_types":["Message"]}},"id":"reactflow__edge-TextInput-5MmdW{œdataTypeœ:œTextInputœ,œidœ:œTextInput-5MmdWœ,œnameœ:œtextœ,œoutput_typesœ:[œMessageœ]}-Prompt-8rDKv{œfieldNameœ:œoutput_exampleœ,œidœ:œPrompt-8rDKvœ,œinputTypesœ:[œMessageœ,œTextœ],œtypeœ:œstrœ}","className":""},{"source":"GroqWhisperComponent-Lep46","sourceHandle":"{œdataTypeœ:œGroqWhisperComponentœ,œidœ:œGroqWhisperComponent-Lep46œ,œnameœ:œtranscriptionœ,œoutput_typesœ:[œMessageœ]}","target":"Prompt-8rDKv","targetHandle":"{œfieldNameœ:œtranscriptionœ,œidœ:œPrompt-8rDKvœ,œinputTypesœ:[œMessageœ,œTextœ],œtypeœ:œstrœ}","data":{"targetHandle":{"fieldName":"transcription","id":"Prompt-8rDKv","inputTypes":["Message","Text"],"type":"str"},"sourceHandle":{"dataType":"GroqWhisperComponent","id":"GroqWhisperComponent-Lep46","name":"transcription","output_types":["Message"]}},"id":"reactflow__edge-GroqWhisperComponent-Lep46{œdataTypeœ:œGroqWhisperComponentœ,œidœ:œGroqWhisperComponent-Lep46œ,œnameœ:œtranscriptionœ,œoutput_typesœ:[œMessageœ]}-Prompt-8rDKv{œfieldNameœ:œtranscriptionœ,œidœ:œPrompt-8rDKvœ,œinputTypesœ:[œMessageœ,œTextœ],œtypeœ:œstrœ}","className":""},{"source":"Prompt-8rDKv","sourceHandle":"{œdataTypeœ:œPromptœ,œidœ:œPrompt-8rDKvœ,œnameœ:œpromptœ,œoutput_typesœ:[œMessageœ]}","target":"OpenAIModel-iM892","targetHandle":"{œfieldNameœ:œinput_valueœ,œidœ:œOpenAIModel-iM892œ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","data":{"targetHandle":{"fieldName":"input_value","id":"OpenAIModel-iM892","inputTypes":["Message"],"type":"str"},"sourceHandle":{"dataType":"Prompt","id":"Prompt-8rDKv","name":"prompt","output_types":["Message"]}},"id":"reactflow__edge-Prompt-8rDKv{œdataTypeœ:œPromptœ,œidœ:œPrompt-8rDKvœ,œnameœ:œpromptœ,œoutput_typesœ:[œMessageœ]}-OpenAIModel-iM892{œfieldNameœ:œinput_valueœ,œidœ:œOpenAIModel-iM892œ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","className":""},{"source":"OpenAIModel-iM892","sourceHandle":"{œdataTypeœ:œOpenAIModelœ,œidœ:œOpenAIModel-iM892œ,œnameœ:œtext_outputœ,œoutput_typesœ:[œMessageœ]}","target":"JSONCleaner-dSEIi","targetHandle":"{œfieldNameœ:œjson_strœ,œidœ:œJSONCleaner-dSEIiœ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","data":{"targetHandle":{"fieldName":"json_str","id":"JSONCleaner-dSEIi","inputTypes":["Message"],"type":"str"},"sourceHandle":{"dataType":"OpenAIModel","id":"OpenAIModel-iM892","name":"text_output","output_types":["Message"]}},"id":"reactflow__edge-OpenAIModel-iM892{œdataTypeœ:œOpenAIModelœ,œidœ:œOpenAIModel-iM892œ,œnameœ:œtext_outputœ,œoutput_typesœ:[œMessageœ]}-JSONCleaner-dSEIi{œfieldNameœ:œjson_strœ,œidœ:œJSONCleaner-dSEIiœ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","className":""},{"source":"JSONCleaner-dSEIi","sourceHandle":"{œdataTypeœ:œJSONCleanerœ,œidœ:œJSONCleaner-dSEIiœ,œnameœ:œoutputœ,œoutput_typesœ:[œMessageœ]}","target":"TextOutput-By44u","targetHandle":"{œfieldNameœ:œinput_valueœ,œidœ:œTextOutput-By44uœ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","data":{"targetHandle":{"fieldName":"input_value","id":"TextOutput-By44u","inputTypes":["Message"],"type":"str"},"sourceHandle":{"dataType":"JSONCleaner","id":"JSONCleaner-dSEIi","name":"output","output_types":["Message"]}},"id":"reactflow__edge-JSONCleaner-dSEIi{œdataTypeœ:œJSONCleanerœ,œidœ:œJSONCleaner-dSEIiœ,œnameœ:œoutputœ,œoutput_typesœ:[œMessageœ]}-TextOutput-By44u{œfieldNameœ:œinput_valueœ,œidœ:œTextOutput-By44uœ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","className":""},{"source":"GroqWhisperComponent-Lep46","sourceHandle":"{œdataTypeœ:œGroqWhisperComponentœ,œidœ:œGroqWhisperComponent-Lep46œ,œnameœ:œtranscriptionœ,œoutput_typesœ:[œMessageœ]}","target":"TextOutput-V5ldV","targetHandle":"{œfieldNameœ:œinput_valueœ,œidœ:œTextOutput-V5ldVœ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","data":{"targetHandle":{"fieldName":"input_value","id":"TextOutput-V5ldV","inputTypes":["Message"],"type":"str"},"sourceHandle":{"dataType":"GroqWhisperComponent","id":"GroqWhisperComponent-Lep46","name":"transcription","output_types":["Message"]}},"id":"reactflow__edge-GroqWhisperComponent-Lep46{œdataTypeœ:œGroqWhisperComponentœ,œidœ:œGroqWhisperComponent-Lep46œ,œnameœ:œtranscriptionœ,œoutput_typesœ:[œMessageœ]}-TextOutput-V5ldV{œfieldNameœ:œinput_valueœ,œidœ:œTextOutput-V5ldVœ,œinputTypesœ:[œMessageœ],œtypeœ:œstrœ}","className":""}],"viewport":{"x":1475.93280164109,"y":49.891604442645985,"zoom":0.8393642050674969}},"description":"A Flow that processes an audio using Groq Whisper, process it and return a JSON of the analysis.","name":"Meeting Mind","last_tested_version":"1.0.18","endpoint_name":null,"is_component":false}
```

