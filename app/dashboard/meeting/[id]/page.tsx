'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MeetingDetails from "@/components/MeetingDetails";

interface MeetingData {
  id: string;
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
          setData({ ...response.data, id: meetingId });
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
