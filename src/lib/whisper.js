import WhisperWorker from '../worker.js?worker';

export class WhisperManager {
    constructor(onResult, onStatus) {
        this.onResult = onResult;
        this.onStatus = onStatus;
        this.worker = null;
        this.audioContext = null;
        this.mediaStream = null;
        this.processor = null;
        this.audioBuffer = []; // Store Float32 chunks
        this.isLoaded = false;

        // Initialize Worker using Vite's explicit worker import
        try {
            this.worker = new WhisperWorker();

            this.worker.onmessage = (event) => {
                const { type, text, error } = event.data;
                if (type === 'ready') {
                    this.isLoaded = true;
                    if (this.onStatus) this.onStatus('ready');
                } else if (type === 'result') {
                    // When processing finishes
                    if (this.onResult) this.onResult(text);
                    if (this.onStatus) this.onStatus('stopped');
                } else if (type === 'error') {
                    console.error('Whisper Worker Error:', error);
                    if (this.onStatus) this.onStatus('error', error);
                }
            };

            this.worker.postMessage({ type: 'load' });
        } catch (e) {
            console.error('Worker Error:', e);
            if (this.onStatus) this.onStatus('error', 'Failed to load AI Worker');
        }
    }

    async start() {
        if (!this.isLoaded) {
            console.warn('Model not loaded yet');
            return;
        }

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioBuffer = []; // Reset buffer

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // 4096 samples = ~0.25s
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Store copy of data
                this.audioBuffer.push(new Float32Array(inputData));
            };

            if (this.onStatus) this.onStatus('recording');

        } catch (err) {
            console.error('Microphone Error:', err);
            if (this.onStatus) this.onStatus('error', err.message);
        }
    }

    stop() {
        // 1. Stop Recording
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        // 2. Transcribe
        if (this.audioBuffer.length > 0) {
            if (this.onStatus) this.onStatus('processing'); // Notify UI we are transcribing

            // Flatten buffer
            const totalLength = this.audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);
            const fullAudio = new Float32Array(totalLength);
            let offset = 0;
            for (const chunk of this.audioBuffer) {
                fullAudio.set(chunk, offset);
                offset += chunk.length;
            }

            // Send to worker
            if (this.worker) {
                this.worker.postMessage({
                    type: 'process',
                    audio: fullAudio
                });
            }
        } else {
            if (this.onStatus) this.onStatus('stopped');
        }
    }

    terminate() {
        this.stop();
        if (this.worker) {
            this.worker.terminate();
        }
    }
}
