// hooks/useVoiceRecognition.ts
import { useState, useEffect } from 'react';
import VoiceService from '../services/voiceService';
import { VoiceRecognitionResult } from '../types/search.types';

export const useVoiceRecognition = (
    onRoleDetected: (role: 'worker' | 'customer') => void
) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [voiceService] = useState(() => VoiceService.getInstance());
    const [isVoiceSupported, setIsVoiceSupported] = useState(true);

    useEffect(() => {
        setIsVoiceSupported(voiceService.isSpeechRecognitionSupported());
    }, [voiceService]);

    const handleVoiceResult = (result: VoiceRecognitionResult) => {
        setTranscript(result.transcript);

        if (result.isFinal) {
            const lowerTranscript = result.transcript.toLowerCase();

            if (lowerTranscript.includes('worker')) {
                onRoleDetected('worker');
                setIsListening(false);
                voiceService.stopListening();
            } else if (lowerTranscript.includes('customer')) {
                onRoleDetected('customer');
                setIsListening(false);
                voiceService.stopListening();
            }
        }
    };

    const handleVoiceError = (errorMessage: string) => {
        setError(errorMessage);
        setIsListening(false);
        setTimeout(() => setError(null), 3000);
    };

    const handleVoiceClick = () => {
        if (!isVoiceSupported) {
            setError("Voice recognition is not supported in your browser");
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (isListening) {
            voiceService.stopListening();
            setIsListening(false);
            setTranscript('');
        } else {
            setIsListening(true);
            setTranscript('');
            setError(null);
            voiceService.startListening(handleVoiceResult, handleVoiceError);
        }
    };

    const stopListening = () => {
        if (isListening) {
            voiceService.stopListening();
            setIsListening(false);
        }
    };

    return {
        isListening,
        transcript,
        error,
        isVoiceSupported,
        handleVoiceClick,
        stopListening
    };
};

export default useVoiceRecognition;
