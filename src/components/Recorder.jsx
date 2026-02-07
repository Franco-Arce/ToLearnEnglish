import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { SpeechManager } from '../lib/speech';

export default function Recorder({ onTranscript, onStop }) {
    const [isRecording, setIsRecording] = useState(false);
    const [permission, setPermission] = useState(false);
    const speechManager = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Manager
        speechManager.current = new SpeechManager(
            (text) => onTranscript(text),
            () => setIsRecording(false),
            (error) => {
                console.error('Speech Error:', error);
                setIsRecording(false);
                if (onStop) onStop(); // Trigger analysis even on error if we have some text
                if (error === 'network') {
                    alert('Network error: Please check your connection. Web Speech API requires internet access.');
                }
            }
        );

        return () => {
            if (speechManager.current) speechManager.current.stop();
            if (audioContextRef.current) audioContextRef.current.close();
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [onTranscript]);

    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermission(true);

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            const draw = () => {
                animationFrameRef.current = requestAnimationFrame(draw);
                analyserRef.current.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, width, height);

                const barWidth = (width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;

                    // Premium Gradient
                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradient.addColorStop(0, '#38bdf8');
                    gradient.addColorStop(1, '#818cf8');

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            };

            draw();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setPermission(false);
        }
    };

    const toggleRecording = () => {
        if (!isRecording) {
            startVisualizer();
            speechManager.current.start();
            setIsRecording(true);
        } else {
            speechManager.current.stop();
            setIsRecording(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            // Clear canvas
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }

            if (onStop) onStop();
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="relative w-full h-32 mb-6 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
                {!isRecording && (
                    <div className="text-gray-500 text-sm">Waveform Visualizer</div>
                )}
                <canvas ref={canvasRef} width={600} height={128} className="w-full h-full absolute inset-0" />
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording
                    ? 'bg-red-500 shadow-red-500/30'
                    : 'bg-blue-500 shadow-blue-500/30'
                    }`}
            >
                {isRecording ? <Square fill="white" size={24} /> : <Mic color="white" size={28} />}
            </motion.button>

            <p className="mt-4 text-sm font-medium text-gray-400">
                {isRecording ? 'Listening...' : 'Tap to Speak'}
            </p>
        </div>
    );
}
