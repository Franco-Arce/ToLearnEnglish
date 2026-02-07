import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const tenses = [
    {
        name: 'Simple Present',
        usage: 'Habits, general truths',
        structure: 'Subject + Verb (s/es)',
        example: 'She plays the piano.',
        color: 'from-blue-400 to-cyan-400'
    },
    {
        name: 'Present Continuous',
        usage: 'Actions happening now',
        structure: 'Subject + am/is/are + Verb-ing',
        example: 'They are watching TV.',
        color: 'from-emerald-400 to-teal-400'
    },
    {
        name: 'Present Perfect',
        usage: 'Past actions with present relevance',
        structure: 'Subject + have/has + V3 (Past Participle)',
        example: 'I have finished my homework.',
        color: 'from-purple-400 to-pink-400'
    },
    {
        name: 'Simple Past',
        usage: 'Completed past actions',
        structure: 'Subject + V2 (Past Form)',
        example: 'He visited Paris last year.',
        color: 'from-amber-400 to-orange-400'
    },
    {
        name: 'Future Simple',
        usage: 'Predictions, promises',
        structure: 'Subject + will + Verb',
        example: 'I will call you later.',
        color: 'from-rose-400 to-red-400'
    }
];

export default function GrammarRef() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full glass-panel p-6 mt-8">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Cheat Sheet: Master Tenses
                </h2>
                <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenses.map((tense, index) => (
                        <motion.div
                            key={tense.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-all"
                        >
                            <h3 className={`font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r ${tense.color} mb-2`}>
                                {tense.name}
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-400"><span className="text-gray-500 font-semibold">Use:</span> {tense.usage}</p>
                                <div className="p-2 rounded bg-black/20 font-mono text-xs text-slate-300">
                                    {tense.structure}
                                </div>
                                <p className="text-gray-300 italic">"{tense.example}"</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
