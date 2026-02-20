// Voice Recognition Service
import { VoiceRecognitionResult } from "../types/search.types";

class VoiceService {
  private static instance: VoiceService;
  private recognition: any = null;
  private isSupported: boolean = false;

  private constructor() {
    this.initializeRecognition();
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initializeRecognition(): void {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      this.isSupported = true;
    } else {
      console.warn("Speech recognition is not supported in this browser");
      this.isSupported = false;
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return this.isSupported;
  }

  public startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
  ): void {
    if (!this.isSupported || !this.recognition) {
      onError("Speech recognition is not supported in your browser");
      return;
    }

    try {
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const confidence = event.results[last][0].confidence;
        const isFinal = event.results[last].isFinal;

        onResult({
          transcript: transcript.trim(),
          confidence,
          isFinal,
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        onError(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      this.recognition.start();
    } catch (error) {
      onError("Failed to start speech recognition");
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  }
}

export default VoiceService;
