import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, ChevronRight, Clock, MessageSquare } from 'lucide-react';

export default function SessionHistory({ sessions, onSelect, onDelete, onClear }) {
    if (sessions.length === 0) return null;

    return (
        <section className="glass-panel p-6 mt-8 w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <History className="text-indigo-400" size={24} />
                    <h3 className="text-xl font-bold text-gray-100">Practice History</h3>
                </div>
                <button
                    onClick={onClear}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                    <Trash2 size={14} /> Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer"
                            onClick={() => onSelect(session)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-xs text-indigo-300">
                                    <Clock size={12} />
                                    {new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase">
                                    {session.roleplay}
                                </div>
                            </div>

                            <p className="text-sm text-gray-200 line-clamp-2 mb-3 h-10 italic">
                                "{session.transcript}"
                            </p>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase">Score</span>
                                        <span className={`text-sm font-bold ${session.analysis.fluency_score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {session.analysis.fluency_score}/100
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(session.id);
                                    }}
                                    className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
