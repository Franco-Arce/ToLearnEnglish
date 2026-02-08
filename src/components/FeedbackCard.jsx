import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Sparkles, Loader2, Lightbulb } from 'lucide-react';

export default function FeedbackCard({ transcript, analysis, isAnalyzing }) {
    return (
        <div className="w-full glass-panel p-6 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20} />
                    AI Analysis
                </h2>
                <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-black/20">
                    {isAnalyzing ? (
                        <span className="flex items-center gap-1">
                            <Loader2 className="animate-spin" size={10} /> Thinking...
                        </span>
                    ) : analysis ? 'Completed' : 'Ready'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg bg-black/20 text-lg leading-relaxed text-gray-200 min-h-[100px]">
                {transcript || (
                    <span className="text-gray-500 italic">
                        Your speech will appear here...
                    </span>
                )}
            </div>

            {/* Analysis Section */}
            <AnimatePresence>
                {analysis && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-white/10 pt-4 space-y-3"
                    >
                        {/* Overall Score */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Fluency Score</span>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
                                        style={{ width: `${analysis.fluency_score}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-white">{analysis.fluency_score}/100</span>
                            </div>
                        </div>

                        {/* Positive Feedback */}
                        {analysis.positive_feedback && (
                            <div className="text-sm text-green-300 italic mb-2">
                                "{analysis.positive_feedback}"
                            </div>
                        )}

                        {/* Corrections */}
                        {analysis.grammar_corrections && analysis.grammar_corrections.length > 0 ? (
                            analysis.grammar_corrections.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-sm text-red-300 font-semibold">Grammar Correction</p>
                                        <p className="text-xs text-gray-300 mt-1">
                                            "{item.original}" &rarr; <span className="text-green-400 font-bold">"{item.correction}"</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 italic">{item.explanation}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-start gap-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                                <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-green-300 font-semibold">Perfect Grammar!</p>
                                    <p className="text-xs text-gray-400">No mistakes found. Keep it up!</p>
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {analysis.tips && analysis.tips.length > 0 && (
                            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="text-blue-400" size={16} />
                                    <span className="text-sm font-semibold text-blue-300">Quick Tips</span>
                                </div>
                                <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                                    {analysis.tips.map((tip, idx) => (
                                        <li key={idx}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
