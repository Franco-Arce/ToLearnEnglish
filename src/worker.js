
import { pipeline, env } from '@xenova/transformers';

// Skip local model check
env.allowLocalModels = false;

let transcriber = null;

self.addEventListener('message', async (event) => {
    const message = event.data;

    switch (message.type) {
        case 'load':
            try {
                if (!transcriber) {
                    // Use the quantized tiny English model for best performance/size ratio in browser
                    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
                    self.postMessage({ type: 'ready' });
                } else {
                    self.postMessage({ type: 'ready' });
                }
            } catch (error) {
                console.error('Worker Load Error:', error);
                self.postMessage({ type: 'error', error: error.message });
            }
            break;

        case 'process':
            try {
                if (!transcriber) {
                    throw new Error('Transcriber not loaded');
                }

                // Audio must be float32 array at 16000Hz
                const output = await transcriber(message.audio, {
                    chunk_length_s: 30,
                    stride_length_s: 5,
                    language: 'english',
                    task: 'transcribe',
                });

                self.postMessage({ type: 'result', text: output.text });
            } catch (error) {
                console.error('Worker Process Error:', error);
                self.postMessage({ type: 'error', error: error.message });
            }
            break;
    }
});
