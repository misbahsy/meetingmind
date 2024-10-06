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