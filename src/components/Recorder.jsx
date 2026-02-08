import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';

export default function Recorder({ onTranscript, onStop, onStart }) {
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, recording, processing, error
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
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
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = dataArray[i] / 2;
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
            return stream;
        } catch (err) {
            console.error('Visualizer Error:', err);
            return null;
        }
    };

    const startRecording = async () => {
        try {
            if (onStart) onStart();
            const stream = await startVisualizer();
            if (!stream) throw new Error('Could not access microphone');

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                // Clear visualizer
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }

                // Stop tracks
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current) audioContextRef.current.close();
                audioContextRef.current = null;

                // Process
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await transcribeAudio(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setStatus('recording');
        } catch (err) {
            console.error(err);
            setStatus('error');
            alert('Error starting recording: ' + err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setStatus('processing');
        }
    };

    const transcribeAudio = async (audioBlob) => {
        const apiKey = localStorage.getItem('groq_api_key');
        if (!apiKey) {
            setStatus('error');
            alert('Please configure your Groq API Key in Settings first!');
            // Open settings hint?
            return;
        }

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'audio/webm' // Raw body
                },
                body: audioBlob
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transcription failed');
            }

            const data = await response.json();
            if (data.text) {
                onTranscript(data.text);
                if (onStop) onStop(data.text);
                setStatus('idle');
            }
        } catch (error) {
            console.error('API Error:', error);
            setStatus('error');
            alert('Transcription Error: ' + error.message);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="relative w-full h-32 mb-6 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
                {status !== 'recording' && (
                    <div className="text-gray-500 text-sm">
                        {status === 'processing' ? 'Processing...' : 'Waveform Visualizer'}
                    </div>
                )}
                <canvas ref={canvasRef} width={600} height={128} className="w-full h-full absolute inset-0" />
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={status === 'processing'}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${status === 'processing' ? 'bg-gray-600 cursor-not-allowed' :
                    isRecording
                        ? 'bg-red-500 shadow-red-500/30'
                        : 'bg-blue-500 shadow-blue-500/30'
                    }`}
            >
                {status === 'processing' ? (
                    <Loader2 className="animate-spin text-white" size={24} />
                ) : (
                    isRecording ? <Square fill="white" size={24} /> : <Mic color="white" size={28} />
                )}
            </motion.button>

            <p className="mt-4 text-sm font-medium text-gray-400">
                {status === 'processing' ? 'Transcribing (Cloud)...' :
                    isRecording ? 'Listening...' : 'Tap to Speak'}
            </p>
        </div>
    );
}
