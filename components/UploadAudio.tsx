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
