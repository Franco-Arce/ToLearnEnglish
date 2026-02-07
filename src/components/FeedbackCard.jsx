import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function FeedbackCard({ transcript, analysis }) {
    return (
        <div className="w-full glass-panel p-6 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20} />
                    AI Analysis
                </h2>
                <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-black/20">
                    {transcript ? 'Processing...' : 'Ready'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg bg-black/20 text-lg leading-relaxed text-gray-200">
                {transcript || (
                    <span className="text-gray-500 italic">
                        Your speech will appear here...
                    </span>
                )}
            </div>

            {/* Mock Feedback Section */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-white/10 pt-4"
                    >
                        <div className="flex items-start gap-3 p-3 rounded bg-red-500/10 border border-red-500/20 mb-2">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm text-red-300 font-semibold">Grammar Correction</p>
                                <p className="text-xs text-gray-400">"I has been" &rarr; "I have been"</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                            <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm text-green-300 font-semibold">Great Pronunciation</p>
                                <p className="text-xs text-gray-400">Your intonation was excellent in this sentence.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
