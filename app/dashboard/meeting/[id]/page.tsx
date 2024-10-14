'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MeetingDetails from "@/components/MeetingDetails";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

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

const MeetingPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const [data, setData] = useState<MeetingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching meeting details for ID:", meetingId);
    if (meetingId) {
      fetchMeetingDetails(meetingId);
    }
  }, [meetingId]);

  const fetchMeetingDetails = async (id: string) => {
    try {
      const response = await axios.get(`/api/meetings/${id}`);
      console.log("Received meeting data:", response.data);
      setData(response.data);
    } catch (err: any) {
      console.error("Error fetching meeting details:", err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError("Meeting not found.");
      } else {
        setError("Failed to fetch meeting details.");
      }
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={handleGoBack} className="mb-4 flex items-center text-purple-500 hover:text-purple-700">
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </Button>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={handleGoBack} className="mb-4 flex items-center text-purple-500 hover:text-purple-700">
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </Button>
        Loading...
      </div>
    );
  }

  console.log("Rendering MeetingDetails with data:", data);
  return (
    <div className="container mx-auto p-6">
      <Button onClick={handleGoBack} className="mb-4 flex items-center text-purple-500 hover:text-purple-700">
        <ArrowLeft className="mr-2" size={20} />
        Back to Dashboard
      </Button>
      <MeetingDetails data={data} />
    </div>
  );
}

export default MeetingPage;
