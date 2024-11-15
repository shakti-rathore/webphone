import React, { useEffect, useRef, useState } from 'react';

function SpeechRecognitionComponent() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  // Function to start the WebRTC stream and loop it to the virtual microphone
  const startStream = async () => {
    // Assume you have a WebRTC stream, replace with your stream source
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); 
    audioStreamRef.current = stream;

    // Create AudioContext and MediaStreamDestination
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const streamDestination = audioContext.createMediaStreamDestination();

    // Connect stream to destination
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(streamDestination);

    // Optional: Play audio locally
    const audioElement = new Audio();
    audioElement.srcObject = stream;
    audioElement.play();

    // Use the destination stream as a new microphone input (assumes virtual microphone is set as default)
    startSpeechRecognition(streamDestination.stream);
  };

  // Initialize SpeechRecognition and start listening
  const startSpeechRecognition = (audioStream) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      setTranscript((prev) => prev + ' ' + finalTranscript);
    };

    recognition.onerror = (error) => {
      console.error('Speech recognition error:', error);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (isListening) {
        recognition.start(); // restart if needed
      }
    };

    recognition.start();
  };

  // Start button handler
  const handleStart = () => {
    setIsListening(true);
    startStream();
  };

  // Stop button handler
  const handleStop = () => {
    setIsListening(false);

    // Stop all tracks and close audio context
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => handleStop();
  }, []);

  return (
    <div>
      <button onClick={handleStart} disabled={isListening}>
        Start Speech Recognition
      </button>
      <button onClick={handleStop} disabled={!isListening}>
        Stop
      </button>
      <p>Transcript: {transcript}</p>
    </div>
  );
}

export default SpeechRecognitionComponent;
