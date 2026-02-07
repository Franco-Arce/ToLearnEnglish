export class WhisperManager {
    constructor(onResult, onStatus) {
        this.onResult = onResult;
        this.onStatus = onStatus;
        this.worker = null;
        this.audioContext = null;
        this.mediaStream = null;
        this.processor = null;
        this.isLoaded = false;

        // Initialize Worker
        this.worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });

        this.worker.onmessage = (event) => {
            const { type, text, error } = event.data;
            if (type === 'ready') {
                this.isLoaded = true;
                if (this.onStatus) this.onStatus('ready');
            } else if (type === 'result') {
                if (this.onResult) this.onResult(text);
            } else if (type === 'error') {
                console.error('Whisper Worker Error:', error);
                if (this.onStatus) this.onStatus('error', error);
            }
        };

        this.worker.postMessage({ type: 'load' });
    }

    async start() {
        if (!this.isLoaded) {
            console.warn('Model not loaded yet');
            return;
        }

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create AudioContext at 16kHz (required by Whisper)
            // If browser doesn't support forcing sampleRate, we might need a resampler, 
            // but most modern browsers do support it now or handle it.
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // Use ScriptProcessor for broad compatibility (AudioWorklet is better but more complex to setup in one file)
            // Buffer size 4096 = ~0.25s of audio at 16kHz
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Send copy of data to worker
                this.worker.postMessage({
                    type: 'process',
                    audio: Array.from(inputData) // Copy to avoid detachment issues or shared buffer races
                });
            };

            if (this.onStatus) this.onStatus('recording');

        } catch (err) {
            console.error('Microphone Error:', err);
            if (this.onStatus) this.onStatus('error', err.message);
        }
    }

    stop() {
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

        if (this.onStatus) this.onStatus('stopped');
    }

    terminate() {
        this.stop();
        if (this.worker) {
            this.worker.terminate();
        }
    }
}
