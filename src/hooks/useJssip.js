import React, { useState, useEffect, useRef, useContext } from 'react';
import HistoryContext from '../context/HistoryContext';
import { useNavigate } from 'react-router-dom';
import { useStopwatch } from 'react-timer-hook';
import JsSIP from 'jssip';
import { LocalNotifications } from '@capacitor/local-notifications';

const useJssip = () => {
  const { setHistory, username, password } = useContext(HistoryContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ua, setUa] = useState(null);
  const [session, setSession] = useState(null);
  const [bridgeID, setBridgeID] = useState('');
  const [status, setStatus] = useState('start');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunks = useRef([]);
  const audioRef = useRef();
  const { seconds, minutes, isRunning, pause, reset } = useStopwatch({
    autoStart: false,
  });
  const navigate = useNavigate();

  const showIncomingCallNotification = async (callDetails) => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Incoming Call',
          body: `Call from ${callDetails.caller}`,
          id: 1,
          sound: 'default',
        },
      ],
    });
  };

  const [currentCallDetails, setCurrentCallDetails] = useState({
    direction: '',
    startTime: null,
    number: '',
  });

  // Modified function to start recording
  const startRecording = async (currentSession) => {
    if (!currentSession) return;

    try {
      const audioStream = new MediaStream();

      // Add both local and remote audio tracks to the stream
      currentSession.connection.getReceivers().forEach((receiver) => {
        if (receiver.track.kind === 'audio') {
          audioStream.addTrack(receiver.track);
        }
      });

      currentSession.connection.getSenders().forEach((sender) => {
        if (sender.track && sender.track.kind === 'audio') {
          audioStream.addTrack(sender.track);
        }
      });

      const recorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm',
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          chunks.current = [];

          // Generate filename
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const direction = currentCallDetails.direction || 'unknown';
          const phoneNum = currentCallDetails.number || 'unknown';
          const fileName = `call-${direction}-${phoneNum}-${timestamp}.wav`;

          // Convert to WAV and trigger download
          const wavBlob = await convertToWav(blob);
          const url = URL.createObjectURL(wavBlob);

          // Create hidden download link
          const downloadLink = document.createElement('a');
          downloadLink.style.display = 'none';
          downloadLink.href = url;
          downloadLink.download = fileName;

          // Add to DOM, trigger download, and cleanup
          document.body.appendChild(downloadLink);
          downloadLink.click();

          // Cleanup after short delay to ensure download starts
          setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
          }, 100);
        } catch (error) {
          console.error('Error processing recording:', error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);

      // Update call details
      setCurrentCallDetails({
        direction: currentSession.direction || 'outgoing',
        startTime: new Date(),
        number: phoneNumber || currentSession?.remote_identity?.uri?.user || 'unknown',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };
  // Modified event handlers
  var eventHandlers = {
    failed: function (e) {
      stopRecording();
      setStatus('fail');
      setPhoneNumber('');
      setCurrentCallDetails({
        direction: '',
        startTime: null,
        number: '',
      });
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], status: 'Fail', start: 0, end: 0 }]);
    },

    confirmed: function (e) {
      reset();
      startRecording(session);
      setHistory((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          status: 'Success',
          start: new Date().getTime(),
        },
      ]);
    },

    ended: function (e) {
      stopRecording(); // This will trigger the automatic download
      console.log('call ended');
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
      pause();
      setStatus('start');
      setPhoneNumber('');
      setCurrentCallDetails({
        direction: '',
        startTime: null,
        number: '',
      });
    },
  };

  // Keep the existing convertToWav and encodeWAV functions...
  const convertToWav = async (blob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const wavBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      wavBuffer.copyToChannel(channelData, channel);
    }

    const wavData = encodeWAV(wavBuffer);
    return new Blob([wavData], { type: 'audio/wav' });
  };
  // Function to encode audio buffer to WAV format
  const encodeWAV = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const buffer = audioBuffer.getChannelData(0);
    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(arrayBuffer);

    // Write WAV header
    writeString(dataView, 0, 'RIFF');
    dataView.setUint32(4, totalSize - 8, true);
    writeString(dataView, 8, 'WAVE');
    writeString(dataView, 12, 'fmt ');
    dataView.setUint32(16, 16, true);
    dataView.setUint16(20, format, true);
    dataView.setUint16(22, numChannels, true);
    dataView.setUint32(24, sampleRate, true);
    dataView.setUint32(28, sampleRate * blockAlign, true);
    dataView.setUint16(32, blockAlign, true);
    dataView.setUint16(34, bitDepth, true);
    writeString(dataView, 36, 'data');
    dataView.setUint32(40, dataSize, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < samples; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const value = Math.max(-1, Math.min(1, sample));
        dataView.setInt16(offset, value * 0x7fff, true);
        offset += bytesPerSample;
      }
    }

    return arrayBuffer;
  };

  // Helper function to write strings to DataView
  const writeString = (dataView, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      dataView.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  // Modified session handling for incoming calls
  useEffect(() => {
    if (session) {
      session.on('confirmed', () => {
        startRecording(session);
      });

      session.on('ended', () => {
        stopRecording();
      });

      session.on('failed', () => {
        stopRecording();
      });
    }
  }, [session]);

  var options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true },
  };

  const changeAudioDevice = async (deviceId) => {
    setSelectedDeviceId(deviceId);
    if (session) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        session.connection.getSenders()[0].replaceTrack(stream.getAudioTracks()[0]);
      } catch (error) {
        console.error('Error changing audio device:', error);
      }
    }
  };

  useEffect(() => {
    try {
      var socket = new JsSIP.WebSocketInterface('wss://callapp.iotcom.io:8089/ws');
      var configuration = {
        sockets: [socket],
        session_timers: false,
        uri: `${username.replace('@', '-')}@callapp.iotcom.io:8089`,
        password: password,
      };
      var ua = new JsSIP.UA(configuration);
      ua.start();
      ua.on('newRTCSession', function (e) {
        console.log(e.session.direction);
        console.log(e.session);
        console.log(e.session.direction);
        if (e.session.direction === 'incoming') {
          const incomingnumber = e.request.from._uri._user;
          const isdialing = localStorage.getItem('dialing');
          console.log('isdialing', isdialing);
          if (isdialing === null || isdialing === 'false') {
            console.log('handle fresh incoming call');
            setStatus('Incalling');
            showIncomingCallNotification({ caller: incomingnumber });
            setSession(e.session);
            e.session.once('failed', (e) => {
              console.log('Call failed local event');
              setHistory((prev) => [
                ...prev.slice(0, -1),
                { ...prev[prev.length - 1], end: new Date().getTime(), status: 'Fail' },
              ]);
              pause();
              setStatus('start');
              setPhoneNumber('');
              fetch(`https://callapp.iotcom.io/user/callended${username}`, {
                method: 'POST',
              }).then(() => {
                console.log('call ended API Called');
                fetch(`https://callapp.iotcom.io/user/disposition${username}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    bridgeID: 'web-phone-test',
                    Disposition: 'Webponecall',
                  }),
                }).then(() => {
                  console.log('dispo req send to server');
                });
              });
            });
            reset();
            setHistory((prev) => {
              setPhoneNumber(incomingnumber);
              console.log('phoneNumber', incomingnumber);
              return [
                ...prev,
                {
                  phoneNumber: incomingnumber,
                  type: 'incoming',
                  status: 'Success',
                  start: new Date().getTime(),
                  startTime: new Date(),
                },
              ];
            });
          } else {
            e.session.answer();
            setSession(e.session);
            reset();
            setStatus('calling');
            localStorage.setItem('dialing', false);

            setHistory((prev) => {
              setPhoneNumber(incomingnumber);
              console.log('phoneNumber', incomingnumber);
              return [
                ...prev,
                {
                  phoneNumber: incomingnumber,
                  type: 'incoming',
                  status: 'Success',
                  start: new Date().getTime(),
                  startTime: new Date(),
                },
              ];
            });

            e.session.connection.addEventListener('addstream', (event) => {
              audioRef.current.srcObject = event.stream;
            });
            e.session.once('ended', (e) => {
              stopRecording();
              console.log('Call ended local event');
              setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
              pause();
              setStatus('start');
              setPhoneNumber('');
              console.log('bridge id', bridgeID);
            });
          }
        } else {
          setSession(e.session);
          e.session.connection.addEventListener('addstream', (event) => {
            audioRef.current.srcObject = event.stream;
          });
        }
      });

      setUa(ua);
    } catch (e) {
      console.error(e);
      navigate('/login');
    }

    const enumerateDevices = async () => {
      try {
        // Request permission for audio
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter((device) => device.kind === 'audioinput');
        setDevices(audioDevices);

        if (audioDevices.length > 0) {
          setSelectedDeviceId(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    enumerateDevices();

    // Re-enumerate devices when they change
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, []);

  const handleCall = () => {
    if (phoneNumber) {
      setHistory((prev) => [
        ...prev,
        {
          startTime: new Date(),
          phoneNumber,
        },
      ]);
      localStorage.setItem('dialing', true);

      fetch(`https://callapp.iotcom.io/dialnumber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caller: username, receiver: phoneNumber }),
      }).then(() => {
        console.log('dial api called');
      });
    }
  };

  return [
    seconds,
    minutes,
    status,
    phoneNumber,
    setPhoneNumber,
    handleCall,
    session,
    isRunning,
    audioRef,
    setStatus,
    setBridgeID,
    devices,
    selectedDeviceId,
    changeAudioDevice,
  ];
};

export default useJssip;
