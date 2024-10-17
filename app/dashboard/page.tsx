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

  const handleDelete = async (meetingId: string) => {
    if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/meetings/${meetingId}`);
        toast({
          title: 'Success',
          description: 'Meeting deleted successfully.',
        });
        fetchMeetings(); // Refresh the meetings list
      } catch (error) {
        console.error("Error deleting meeting:", error);
        toast({
          title: 'Error',
          description: 'Failed to delete meeting.',
          variant: 'destructive',
        });
      }
    }
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
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleViewDetails(meeting.id)}
                            className="px-4 py-2 text-sm"
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDelete(meeting.id)}
                            className="px-4 py-2 text-sm"
                          >
                            Delete
                          </Button>
                        </div>
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
