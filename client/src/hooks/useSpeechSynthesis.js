import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for text-to-speech functionality
 * Provides AI voice narration for interview questions
 */
export const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a professional-sounding voice (prefer female English voices)
      const preferredVoice = availableVoices.find(
        voice => voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || availableVoices.find(
        voice => voice.lang.startsWith('en')
      ) || availableVoices[0];
      
      setSelectedVoice(preferredVoice);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speak text with AI voice
  const speak = useCallback((text, options = {}) => {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.voice = selectedVoice;
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onstart = () => {
        setSpeaking(true);
      };

      utterance.onend = () => {
        setSpeaking(false);
        resolve();
      };

      utterance.onerror = (error) => {
        setSpeaking(false);
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice]);

  // Stop speaking
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  // Resume speaking
  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    voices,
    selectedVoice,
    setSelectedVoice
  };
};
