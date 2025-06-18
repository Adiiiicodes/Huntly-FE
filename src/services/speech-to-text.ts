export class SpeechRecognitionService {
  private recognition: SpeechRecognition;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    } else {
      throw new Error('Speech recognition is not supported in this browser');
    }
  }

  startListening(onResult: (text: string) => void, onError: (error: any) => void) {
    if (this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening() {
    if (!this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
  }
} 