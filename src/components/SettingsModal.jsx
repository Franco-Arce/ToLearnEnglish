import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Check, Volume2 } from 'lucide-react';

export default function SettingsModal({
    isOpen,
    onClose,
    level,
    setLevel,
    roleplay,
    setRoleplay,
    preferredVoiceURI,
    setPreferredVoiceURI
}) {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        const loadVoices = () => {
            let allVoices = window.speechSynthesis.getVoices();

            // Some browsers need a moment or a retry
            if (allVoices.length === 0) {
                // Try again in a bit if empty
                setTimeout(() => {
                    allVoices = window.speechSynthesis.getVoices();
                    setVoices(allVoices);
                }, 100);
            }

            setVoices(allVoices);
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const testVoice = () => {
        const utterance = new SpeechSynthesisUtterance("Hello, this is a test of the selected voice.");
        const voice = voices.find(v => v.voiceURI === preferredVoiceURI);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = 'en-US';
        }
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const storedKey = localStorage.getItem('groq_api_key');
        if (storedKey) setApiKey(storedKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('groq_api_key', apiKey);
        localStorage.setItem('app_level', level);
        localStorage.setItem('app_roleplay', roleplay);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2">
                                <Key className="text-sky-400" size={20} />
                                <h2 className="font-semibold text-white">Settings</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Difficulty Level
                                </label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Roleplay Scenario
                                </label>
                                <select
                                    value={roleplay}
                                    onChange={(e) => setRoleplay(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="general">Daily Conversation</option>
                                    <option value="restaurant">Ordering at a Restaurant</option>
                                    <option value="interview">Job Interview</option>
                                    <option value="travel">Travel & Airport</option>
                                    <option value="doctor">Medical Appointment</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Voice Accent (TTS)
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={preferredVoiceURI}
                                            onChange={(e) => setPreferredVoiceURI(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all appearance-none cursor-pointer text-sm"
                                        >
                                            <option value="">Default (Auto-detect English)</option>
                                            {voices
                                                .sort((a, b) => {
                                                    const aIsEn = a.lang.startsWith('en');
                                                    const bIsEn = b.lang.startsWith('en');
                                                    if (aIsEn && !bIsEn) return -1;
                                                    if (!aIsEn && bIsEn) return 1;
                                                    return 0;
                                                })
                                                .map(voice => (
                                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                                        {voice.lang.startsWith('en') ? '🇺🇸 ' : '🌐 '}{voice.name} ({voice.lang})
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <Volume2 size={16} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={testVoice}
                                        type="button"
                                        className="px-4 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-sky-400 hover:bg-white/10 transition-colors"
                                        title="Test voice"
                                    >
                                        Test
                                    </button>
                                </div>
                                <p className="mt-2 text-[10px] text-gray-500 italic">
                                    Select a voice with 🇺🇸 or "en-" to ensure English pronunciation.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Groq API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Required for analysis. 100% Free.
                                    <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline ml-1">
                                        Get one
                                    </a>
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${saved
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'
                                    }`}
                            >
                                {saved ? (
                                    <>
                                        <Check size={18} />
                                        Saved
                                    </>
                                ) : (
                                    'Save Configuration'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
