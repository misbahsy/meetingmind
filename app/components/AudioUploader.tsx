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