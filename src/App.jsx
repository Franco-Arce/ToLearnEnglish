import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Sparkles } from 'lucide-react';
import Recorder from './components/Recorder';
import FeedbackCard from './components/FeedbackCard';
import GrammarRef from './components/GrammarRef';

import SettingsModal from './components/SettingsModal';
import { Settings } from 'lucide-react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTranscript = (text) => {
    setTranscript((prev) => prev + ' ' + text);
  };

  const handleStop = () => {
    if (transcript.length > 5) {
      setAnalysis(true);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex justify-between items-center mb-8 md:mb-12 glass-panel p-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">
          English Accelerator
        </h1>
        <nav className="flex gap-4 items-center">
          <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Dashboard</button>
          <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Practice</button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title="Configure API Key"
          >
            <Settings size={20} />
          </button>
        </nav>
      </motion.header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input & Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          {/* Recorder Component */}
          <Recorder onTranscript={handleTranscript} onStop={handleStop} />

          {/* Upload Section (Placeholder for next task) */}
          <div className="glass-panel p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                <Upload size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-200">Upload Audio</h3>
                <p className="text-xs text-gray-400">Analyze pre-recorded files (MP3, WAV)</p>
              </div>
            </div>
            <div className="px-4 py-2 text-xs font-bold text-white bg-white/10 rounded-full">
              COMING SOON
            </div>
          </div>

          {/* Quick Tips */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-sky-400" />
              <h3 className="font-bold text-lg text-gray-200">Quick Tips</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Try to speak clearly and at a moderate pace. The AI analyzes your grammar, pronunciation, and fluency in real-time to provide instant feedback.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Feedback & Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <FeedbackCard transcript={transcript} analysis={analysis} />
        </motion.div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-6xl mt-8 mb-12"
      >
        <GrammarRef />
      </motion.div>
    </div>
  );
}

export default App;
