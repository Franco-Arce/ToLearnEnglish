import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Sparkles } from 'lucide-react';
import Recorder from './components/Recorder';
import FeedbackCard from './components/FeedbackCard';
import GrammarRef from './components/GrammarRef';
import SessionHistory from './components/SessionHistory';

import SettingsModal from './components/SettingsModal';
import { Settings } from 'lucide-react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // New Settings State
  const [level, setLevel] = useState(localStorage.getItem('app_level') || 'intermediate');
  const [roleplay, setRoleplay] = useState(localStorage.getItem('app_roleplay') || 'general');

  // Session History State
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('app_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading sessions:', e);
      return [];
    }
  });

  const handleTranscript = (text) => {
    // If we're starting a "clean" session, we might want to clear transcript.
    // For now, let's keep it but ensure analysis uses the latest full context if provided.
    setTranscript((prev) => (prev ? prev + ' ' + text : text));
  };

  const handleStop = async (finalText) => {
    const textToAnalyze = finalText || transcript;

    if (!textToAnalyze || textToAnalyze.trim().length < 2) {
      console.warn('Text too short for analysis');
      return;
    }

    setIsAnalyzing(true);
    const apiKey = localStorage.getItem('groq_api_key');

    if (!apiKey) {
      setIsAnalyzing(false);
      alert('Please configure your API Key');
      return;
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          text: textToAnalyze,
          level: level,
          roleplay: roleplay
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);

        // Save to History
        const newSession = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          transcript: textToAnalyze,
          analysis: data,
          level,
          roleplay
        };
        const updatedSessions = [newSession, ...sessions].slice(0, 20); // Keep last 20
        setSessions(updatedSessions);
        localStorage.setItem('app_sessions', JSON.stringify(updatedSessions));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        level={level}
        setLevel={setLevel}
        roleplay={roleplay}
        setRoleplay={setRoleplay}
      />

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
          <Recorder
            onTranscript={handleTranscript}
            onStop={handleStop}
            onStart={() => setTranscript('')}
          />

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
          <FeedbackCard transcript={transcript} analysis={analysis} isAnalyzing={isAnalyzing} />
        </motion.div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-6xl mt-8 mb-4"
      >
        <GrammarRef />
      </motion.div>

      <SessionHistory
        sessions={sessions}
        onSelect={(session) => {
          setTranscript(session.transcript);
          setAnalysis(session.analysis);
          setLevel(session.level || 'intermediate');
          setRoleplay(session.roleplay || 'general');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDelete={(id) => {
          const updated = sessions.filter(s => s.id !== id);
          setSessions(updated);
          localStorage.setItem('app_sessions', JSON.stringify(updated));
        }}
        onClear={() => {
          if (confirm('Are you sure you want to clear your entire history?')) {
            setSessions([]);
            localStorage.removeItem('app_sessions');
          }
        }}
      />
    </div>
  );
}

export default App;
