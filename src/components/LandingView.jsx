import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Key, Info } from 'lucide-react';

export default function LandingView({ onComplete }) {
    const [apiKey, setApiKey] = useState('');
    const [showSecurityInfo, setShowSecurityInfo] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (apiKey.trim().startsWith('gsk_')) {
            localStorage.setItem('groq_api_key', apiKey.trim());
            onComplete();
        } else {
            alert('Please enter a valid Groq API Key (starts with gsk_).');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--accent-glow)_0%,_transparent_70%)]">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Value Proposition */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
                        <Sparkles size={14} />
                        <span>AI-Powered English Learning</span>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                        Accelerate Your <br />
                        <span className="text-sky-400">English Fluency.</span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                        Master spoken English with real-time AI analysis.
                        Get instant grammar corrections, fluency scores, and personalized tips.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <Zap className="text-yellow-400 h-5 w-5 mt-1" />
                            <div>
                                <h4 className="font-bold text-slate-200">Ultra-Fast</h4>
                                <p className="text-xs text-slate-500">Powered by Groq LPUs</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <ShieldCheck className="text-green-400 h-5 w-5 mt-1" />
                            <div>
                                <h4 className="font-bold text-slate-200">100% Private</h4>
                                <p className="text-xs text-slate-500">Keys stay on your device</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Setup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-8 md:p-10 border-white/10 animate-glow"
                >
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                        <p className="text-slate-400 text-sm">
                            Connect your Groq account to begin practicing.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                                    <Key size={14} className="text-sky-400" />
                                    Enter Groq API Key
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                                >
                                    <Info size={12} />
                                    Is this safe?
                                </button>
                            </div>

                            <input
                                type="password"
                                required
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-mono"
                            />

                            {showSecurityInfo && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10 text-[11px] text-slate-400 leading-normal"
                                >
                                    <strong>Privacy first:</strong> Your API Key is stored only in your browser's local storage. We don't have a server database to store your keys. The key is only sent to Groq's official API to process your requests.
                                </motion.div>
                            )}

                            <p className="text-[11px] text-slate-500 pt-1">
                                Don't have one? Get a free key at
                                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 ml-1 font-bold underline">
                                    Groq Console
                                </a>
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 group transition-all"
                        >
                            Start Practicing
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
