import { useState, useEffect, useRef, useCallback } from 'react';

// Declare Web Speech API interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  isPaused: boolean;
  hasSpeechRecognition: boolean;
  speechError: string | null;
  startListening: (onFinalResult?: (text: string) => void) => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  clearTranscript: () => void;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onFinalCallbackRef = useRef<((text: string) => void) | null>(null);

  // Check speech recognition support
  const hasSpeechRecognition = typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    synthRef.current = window.speechSynthesis;

    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecClass) {
      try {
        const recognition = new SpeechRecClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          const currentText = final || interim;
          if (currentText) {
            setTranscript(currentText);
          }

          if (final && onFinalCallbackRef.current) {
            onFinalCallbackRef.current(final);
          }
        };

        recognition.onerror = (event: any) => {
          // Ignore 'no-speech' or 'aborted' as standard non-breaking events
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('[SpeechRecognition] error:', event.error);
            setSpeechError(event.error === 'not-allowed' ? 'Microphone permission denied' : `Audio capture: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = useCallback((onFinalResult?: (text: string) => void) => {
    if (onFinalResult) {
      onFinalCallbackRef.current = onFinalResult;
    }
    setSpeechError(null);

    // Cancel active speech if currently speaking
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      // If already started, restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch (_) {}
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current || !text) return;

    // Cancel existing
    synthRef.current.cancel();
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96; // slightly measured, authoritative executive pacing
    utterance.pitch = 0.98;

    // Pick a natural voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Serena')))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.warn('[SpeechSynthesis] Error:', e);
      }
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, []);

  const pauseSpeech = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    isPaused,
    hasSpeechRecognition,
    speechError,
    startListening,
    stopListening,
    speak,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    clearTranscript,
  };
}
