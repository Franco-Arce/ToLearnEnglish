import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Mic, Volume2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import Recorder from './Recorder';

export default function ConversationMode({ level, roleplay, preferredVoiceURI }) {
    const [messages, setMessages] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [voices, setVoices] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length > 0) setVoices(v);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        let selectedVoice = voices.find(v => v.voiceURI === preferredVoiceURI);

        if (!selectedVoice) {
            const priorityPatterns = [/Google US English/i, /Google UK English/i, /en-US/i, /en-/i];
            for (const pattern of priorityPatterns) {
                selectedVoice = voices.find(v => pattern.test(v.name) || pattern.test(v.lang));
                if (selectedVoice) break;
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        } else {
            utterance.lang = 'en-US';
        }
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    const handleStop = async (text) => {
        if (!text || text.trim().length < 2) return;

        const userMessage = { id: Date.now(), role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setIsAnalyzing(true);

        const apiKey = localStorage.getItem('groq_api_key');
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                body: JSON.stringify({ text, level, roleplay, isConversation: true })
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'ai',
                    content: data.reply,
                    analysis: data
                };
                setMessages(prev => [...prev, aiMessage]);
                if (data.reply) speak(data.reply);
            }
        } catch (error) {
            console.error('Conversation error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="w-full flex flex-col h-[calc(100vh-200px)] lg:h-[700px]">
            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="p-4 bg-sky-500/10 rounded-full text-sky-400 mb-4 animate-glow">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Start a conversation</h3>
                        <p className="text-slate-400 max-w-xs">
                            Speak to the {roleplay === 'general' ? 'AI teacher' : roleplay} to practice your English in context.
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'} rounded-2xl p-4 shadow-xl border border-white/5`}>
                                <p className="text-white mb-2">{msg.content}</p>

                                {msg.role === 'ai' && msg.analysis && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-sky-400 uppercase">
                                            <span>Grammar Check</span>
                                            <button onClick={() => speak(msg.content)} className="hover:text-white transition-colors">
                                                <Volume2 size={14} />
                                            </button>
                                        </div>

                                        {msg.analysis.grammar_corrections.length > 0 ? (
                                            msg.analysis.grammar_corrections.map((corr, idx) => (
                                                <div key={idx} className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg text-xs">
                                                    <p className="text-rose-400 line-through opacity-50">{corr.original}</p>
                                                    <p className="text-emerald-400 font-bold">{corr.correction}</p>
                                                    <p className="text-slate-500 mt-1 italic">{corr.explanation}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                                <CheckCircle size={14} />
                                                Perfect grammar!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isAnalyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl p-4 border border-white/5 flex gap-2">
                            <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-900/50 border-t border-white/10 rounded-b-3xl">
                <div className="flex flex-col items-center gap-4">
                    <Recorder
                        onTranscript={() => { }}
                        onStop={handleStop}
                        onStart={() => { }}
                    />
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                        Tap to speak to the AI
                    </p>
                </div>
            </div>
        </div>
    );
}
