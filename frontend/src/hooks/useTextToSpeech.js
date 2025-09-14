import { useState, useRef, useCallback } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtteranceId, setCurrentUtteranceId] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const utteranceRef = useRef(null);

  // Check if speech synthesis is supported
  useState(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text, utteranceId = null) => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in this browser');
      return;
    }

    // If already speaking the same utterance, stop it
    if (isSpeaking && currentUtteranceId === utteranceId) {
      stopSpeaking();
      return;
    }

    // Stop any current speech
    stopSpeaking();

    try {
      setError(null);
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure speech settings
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentUtteranceId(utteranceId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtteranceId(null);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setError(`Speech error: ${event.error}`);
        setIsSpeaking(false);
        setCurrentUtteranceId(null);
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setIsSpeaking(false);
      };

      utterance.onresume = () => {
        setIsSpeaking(true);
      };

      // Start speaking
      speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('Error creating speech utterance:', err);
      setError('Failed to create speech utterance');
    }
  }, [isSupported, isSpeaking, currentUtteranceId]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentUtteranceId(null);
    utteranceRef.current = null;
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  const getVoices = useCallback(() => {
    if (!isSupported) return [];
    return speechSynthesis.getVoices();
  }, [isSupported]);

  const setVoice = useCallback((voiceName) => {
    if (!utteranceRef.current || !isSupported) return;
    
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => 
      voice.name === voiceName || voice.name.includes(voiceName)
    );
    
    if (selectedVoice) {
      utteranceRef.current.voice = selectedVoice;
    }
  }, [isSupported]);

  const setRate = useCallback((rate) => {
    if (!utteranceRef.current) return;
    utteranceRef.current.rate = Math.max(0.1, Math.min(10, rate));
  }, []);

  const setPitch = useCallback((pitch) => {
    if (!utteranceRef.current) return;
    utteranceRef.current.pitch = Math.max(0, Math.min(2, pitch));
  }, []);

  const setVolume = useCallback((volume) => {
    if (!utteranceRef.current) return;
    utteranceRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  return {
    isSpeaking,
    currentUtteranceId,
    isSupported,
    error,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    getVoices,
    setVoice,
    setRate,
    setPitch,
    setVolume
  };
};

export default useTextToSpeech;
