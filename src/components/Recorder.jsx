import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { WhisperManager } from '../lib/whisper';

export default function Recorder({ onTranscript, onStop }) {
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('loading'); // loading, ready, recording, error
    const whisperManager = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        // Initialize Whisper Manager
        whisperManager.current = new WhisperManager(
            (text) => {
                // If text is valid, send it up
                if (text && text.trim().length > 0) {
                    onTranscript(text);
                }
            },
            (newStatus, error) => {
                console.log('Whisper Status:', newStatus, error);
                if (newStatus === 'ready') setStatus('ready');
                if (newStatus === 'recording') {
                    setIsRecording(true);
                    setStatus('recording');
                }
                if (newStatus === 'processing') {
                    setIsRecording(false);
                    setStatus('processing');
                }
                if (newStatus === 'stopped') {
                    setIsRecording(false);
                    setStatus('ready');
                }
                if (newStatus === 'error') {
                    console.error(error);
                    alert('AI Error: ' + error);
                    setIsRecording(false);
                    setStatus('ready');
                }
            }
        );

        return () => {
            if (whisperManager.current) whisperManager.current.terminate();
            if (audioContextRef.current) audioContextRef.current.close();
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [onTranscript]);

    const startVisualizer = async () => {
        try {
            // We need a separate stream for visualization if we want to keep it simple, 
            // or we could hook into the manager. For simplicity/robustness, let's just grab a stream.
            // Note: WhisperManager grabs its own stream. It's fine to ask twice (permission usually persists).
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
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
                if (!canvasRef.current) return;

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
            console.error('Visualizer Error:', err);
        }
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            if (status !== 'ready') return;
            startVisualizer();
            await whisperManager.current.start();
        } else {
            whisperManager.current.stop();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            if (onStop) onStop();
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="relative w-full h-32 mb-6 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
                {!isRecording && (
                    <div className="text-gray-500 text-sm">
                        {status === 'loading' ? 'Loading AI Model...' : 'Waveform Visualizer'}
                    </div>
                )}
                <canvas ref={canvasRef} width={600} height={128} className="w-full h-full absolute inset-0" />
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                disabled={status === 'loading'}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${status === 'loading' ? 'bg-gray-600 cursor-not-allowed' :
                    isRecording
                        ? 'bg-red-500 shadow-red-500/30'
                        : 'bg-blue-500 shadow-blue-500/30'
                    }`}
            >
                {status === 'loading' ? (
                    <Loader2 className="animate-spin text-white" size={24} />
                ) : (
                    isRecording ? <Square fill="white" size={24} /> : <Mic color="white" size={28} />
                )}
            </motion.button>

            <p className="mt-4 text-sm font-medium text-gray-400">
                {status === 'loading' ? 'Downloading AI (One time only)...' :
                    isRecording ? 'Listening (Local AI)...' : 'Tap to Speak'}
            </p>
        </div>
    );
}
