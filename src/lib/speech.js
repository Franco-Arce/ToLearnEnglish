export class SpeechManager {
    constructor(onResult, onEnd, onError) {
        this.recognition = null;
        this.isListening = false;
        this.onResult = onResult;
        this.onEnd = onEnd;
        this.onError = onError;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US'; // Default to English

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript) {
                    this.onResult(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                if (this.onError) this.onError(event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onEnd) this.onEnd();
            };
        } else {
            console.error('Browser does not support Speech Recognition');
        }
    }

    start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
            } catch (e) {
                console.error('Error starting recognition:', e);
            }
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}
