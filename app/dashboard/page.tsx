'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
import { useToast } from "@/hooks/use-toast"

const UploadAudio = dynamic(() => import('@/components/UploadAudio'), { ssr: false });
const AudioRecorder = dynamic(() => import('@/components/AudioRecorder'), { ssr: false });

interface Meeting {
  id: string;
  name: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<string>('');
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
    router.push(`/dashboard/meeting/${meetingId}`);
  };

  const handleTranscriptionUpdate = (transcription: string) => {
    setCurrentTranscription(prev => prev + transcription);
  };

  const handleRecordingComplete = (meetingId: string) => {
    fetchMeetings();
    setCurrentTranscription('');
    toast({
      title: 'Recording Complete',
      description: `Meeting ID: ${meetingId}`,
    });
    router.push(`/dashboard/meeting/${meetingId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-2xl font-semibold">Meeting Mind</h1>
      </header>
      <main className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Record or Upload Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioRecorder 
              onTranscriptionUpdate={handleTranscriptionUpdate}
              onRecordingComplete={handleRecordingComplete}
            />
            <UploadAudio onUploadSuccess={fetchMeetings} />
            {currentTranscription && (
              <div>
                <h3 className="font-semibold">Current Transcription:</h3>
                <p>{currentTranscription}</p>
              </div>
            )}
          </CardContent>
        </Card>
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
