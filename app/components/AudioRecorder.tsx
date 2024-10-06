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