import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';

interface AudioRecorderProps {
  onTranscriptionUpdate: (transcription: string) => void;
  onRecordingComplete: (meetingId: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionUpdate, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start(10000); // Collect data every 10 seconds

        interval = setInterval(sendAudioChunk, 10000);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(interval);
    };

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isRecording]);

  const sendAudioChunk = async () => {
    if (chunksRef.current.length === 0) return;

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    if (meetingId) {
      formData.append('meetingId', meetingId);
    }

    try {
      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!meetingId && response.data.meetingId) {
        setMeetingId(response.data.meetingId);
      }

      onTranscriptionUpdate(response.data.transcription);
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (meetingId) {
        onRecordingComplete(meetingId);
      }
    } else {
      setIsRecording(true);
      setMeetingId(null);
    }
  };

  return (
    <Button onClick={handleToggleRecording}>
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </Button>
  );
};

export default AudioRecorder;
