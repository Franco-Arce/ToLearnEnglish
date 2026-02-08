import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Upload, Sparkles } from 'lucide-react';
import Recorder from './components/Recorder';
import FeedbackCard from './components/FeedbackCard';
import GrammarRef from './components/GrammarRef';
import SessionHistory from './components/SessionHistory';
import LandingView from './components/LandingView';
import ConversationMode from './components/ConversationMode';

import SettingsModal from './components/SettingsModal';
import { Settings } from 'lucide-react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(!!localStorage.getItem('groq_api_key'));
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, conversation

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
      setHasKey(false);
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

  if (!hasKey) {
    return <LandingView onComplete={() => setHasKey(true)} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--accent-glow)_0%,_transparent_60%)]">
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
        className="w-full max-w-6xl flex justify-between items-center mb-8 md:mb-12 glass-panel p-6 border-white/10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            English Accelerator
          </h1>
        </div>
        <nav className="flex gap-4 items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('conversation')}
            className={`text-sm font-bold transition-colors ${activeTab === 'conversation' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
          >
            Conversation
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
            title="Settings"
          >
            <Settings size={22} />
          </button>
        </nav>
      </motion.header>

      <main className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Column: Input & Controls */}
              <div className="flex flex-col gap-6">
                <Recorder
                  onTranscript={handleTranscript}
                  onStop={handleStop}
                  onStart={() => setTranscript('')}
                />

                {/* Upload Section */}
                <div className="glass-panel p-6 flex items-center justify-between cursor-not-allowed border-white/5 opacity-80 group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                      <Upload size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200">Upload Audio</h3>
                      <p className="text-xs text-slate-500">Analyze pre-recorded files (MP3, WAV)</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    COMING SOON
                  </div>
                </div>

                <div className="glass-panel p-6 border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-200">Learning Tips</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Try to speak clearly and at a moderate pace. The AI analyzes your grammar, pronunciation, and fluency in real-time to provide instant feedback.
                  </p>
                </div>
              </div>

              {/* Right Column: Feedback */}
              <div className="h-full">
                <FeedbackCard transcript={transcript} analysis={analysis} isAnalyzing={isAnalyzing} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel border-white/10"
            >
              <ConversationMode level={level} roleplay={roleplay} />
            </motion.div>
          )}
        </AnimatePresence>
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
