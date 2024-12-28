import React, { useState, useEffect, useRef, useContext } from 'react';
import HistoryContext from '../context/HistoryContext';
import { useNavigate } from 'react-router-dom';
import { useStopwatch } from 'react-timer-hook';
import JsSIP from 'jssip';
import axios from 'axios';
import toast from 'react-hot-toast';

const useJssip = () => {
  const { setHistory, username, password } = useContext(HistoryContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [conferenceNumber, setConferenceNumber] = useState('');
  const [ua, setUa] = useState(null);
  const [session, setSession] = useState(null);
  const [bridgeID, setBridgeID] = useState('');
  const [status, setStatus] = useState('start');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [userCall, setUserCall] = useState('');
  const [isHeld, setIsHeld] = useState(false);
  const [conferenceStatus, setConferenceStatus] = useState(false);
  const [dispositionModal, setDispositionModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [timeoutArray, setTimeoutArray] = useState([]);
  const agentSocketRef = useRef(null);
  const customerSocketRef = useRef(null);
  const agentMediaRecorderRef = useRef(null);
  const customerMediaRecorderRef = useRef(null);
  const audioRef = useRef();
  const chunks = useRef([]);

  const { seconds, minutes, isRunning, pause, reset } = useStopwatch({
    autoStart: false,
  });
  const navigate = useNavigate();

  const createConferenceCall = async () => {
    try {
      const response = await fetch(`https://callapp.iotcom.io/reqConf/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confNumber: conferenceNumber,
        }).replace(/\s+/g, ''),
      });

      const data = await response.json();
      if (data.message === 'conferance call dialed') {
        if (data.result) {
          setBridgeID(data.result);
        }
        setConferenceStatus(true);
        setStatus('conference');
      } else if (data.message === 'error dialing conferance call') {
        console.error('Conference call dialing failed');

        setStatus('calling');
      } else {
        console.log('Unexpected response:', data.message);
      }
    } catch (error) {
      console.error('Error creating conference call:', error);

      setStatus('calling');
    }
  };

  const connectioncheck = async () => {
    if (isLogin && username) {
      try {
        const response = await Promise.race([
          fetch('https://callapp.iotcom.io/userconnection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: username }),
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 3000);
          }),
        ]);

        if (response.status === 401) {
          window.location.href = '/webphone/login';
          return;
        }

        const data = await response.json();
        if (data.message === 'ok connection for user') {
          setTimeoutArray([]);
        } else if (data.message === 'poor connection problem ,please login again') {
          setIsLogin(false);
          localStorage.clear();
          navigate('/webphone/login');
          toast.error('Connection lost. Please log in again to continue');
        }
      } catch (err) {
        handleConnectionError(err);
      }
    }
  };

  const handleConnectionError = (err) => {
    if (err.message === 'Timeout') {
      const timeout = { timeout: true };
      const newTimeoutArray = [...timeoutArray, timeout];
      setTimeoutArray(newTimeoutArray);

      if (newTimeoutArray.length > 2) {
        setIsLogin(false);
      }
    } else {
      console.error('Error during connection check:', err);
    }
  };

  useEffect(() => {
    if (username) {
      const url = `https://callapp.iotcom.io/userready/${username}`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === 'success') {
            setIsLogin(true);
            keepAliveRef.current = setInterval(() => {
              ua?.on('newMessage', (e) => {
                console.log('Message event:', e);
                connectioncheck();
              });
            }, 5000);
          }
        })
        .catch((error) => {
          console.error('Error sending login request:', error);
        });
    }
  }, [username]);

  const initializeWebSocketTranscription = () => {
    const createWebSocket = (isAgent = true) => {
      const socketRef = isAgent ? agentSocketRef : customerSocketRef;

      const socket = new WebSocket('wss://callapp.iotcom.io/socket');
      socketRef.current = socket;

      socket.onopen = () => {
        // console.log(`${isAgent ? 'Agent' : 'Customer'} WebSocket Connected`);
      };

      socket.onerror = (error) => {
        // console.error(`${isAgent ? 'Agent' : 'Customer'} WebSocket Error:`, error);
      };

      socket.onclose = () => {
        // console.log(`${isAgent ? 'Agent' : 'Customer'} WebSocket Closed`);
        setTimeout(() => {
          createWebSocket(isAgent);
        }, 3000);
      };

      return socket;
    };

    createWebSocket(true);
    createWebSocket(false);
  };

  const startSpeechToText = (stream, isAgent = true) => {
    const websocket = isAgent ? agentSocketRef.current : customerSocketRef.current;
    const mediaRecorderRef = isAgent ? agentMediaRecorderRef : customerMediaRecorderRef;

    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      if (websocket?.readyState === WebSocket.CLOSING || websocket?.readyState === WebSocket.CLOSED) {
        initializeWebSocketTranscription();
      }

      return;
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
        websocket.send(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const tracks = stream.getAudioTracks();
      tracks.forEach((track) => track.stop());

      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify('streamClose'));
      }
    };

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
  };

  const stopSpeechToText = (isAgent = true) => {
    const mediaRecorderRef = isAgent ? agentMediaRecorderRef : customerMediaRecorderRef;
    const websocket = isAgent ? agentSocketRef.current : customerSocketRef.current;

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify('streamClose'));
    }
  };

  useEffect(() => {
    if (status != 'start') {
      initializeWebSocketTranscription();
    }

    return () => {
      if (agentSocketRef.current) {
        agentSocketRef.current.close();
      }
      if (customerSocketRef.current) {
        customerSocketRef.current.close();
      }
    };
  }, []);

  const answercall = async () => {
    try {
      const response = await axios.post(
        `https://callapp.iotcom.io/useroncall/${username}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setBridgeID(response.data.currentcalldata.bridgeID);
        if (response.data.contactData) {
          setUserCall(response.data.contactData);
        }
        setConferenceStatus(false);
        console.log('Call unhold successful');
      } else {
        console.error('Failed to unhold call');
      }
    } catch (error) {
      console.error('Error unholding call:', error);
    }
  };

  const reqUnHold = async () => {
    if (!session) return;

    try {
      const response = await fetch(`https://callapp.iotcom.io/reqUnHold/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bridgeID: session.bridgeID,
        }),
      });

      if (response.ok) {
        if (audioRef.current) {
          audioRef.current.play();
        }
        setConferenceStatus(false);
        console.log('Call unhold successful');
      } else {
        console.error('Failed to unhold call');
      }
    } catch (error) {
      console.error('Error unholding call:', error);
    }
  };

  const toggleHold = async () => {
    if (!session) return;

    try {
      if (!isHeld) {
        await fetch(`https://callapp.iotcom.io/reqHold/${username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bridgeID: session.bridgeID,
          }),
        });

        if (audioRef.current) {
          audioRef.current.pause();
        }

        setIsHeld(true);
      } else {
        await fetch(`https://callapp.iotcom.io/reqUnHold/${username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bridgeID: session.bridgeID,
          }),
        });

        if (audioRef.current) {
          audioRef.current.play();
        }

        setIsHeld(false);
      }
    } catch (error) {
      console.error('Error toggling hold:', error);
    }
  };

  const startRecording = async () => {
    if (!session || isRecording) return;

    try {
      const combinedStream = new MediaStream();

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      });

      const remoteReceivers = session.connection.getReceivers() || [];
      const remoteTracks = remoteReceivers
        .filter((receiver) => receiver.track?.kind === 'audio')
        .map((receiver) => receiver.track)
        .filter(Boolean);

      startSpeechToText(micStream, true);
      if (remoteTracks.length > 0) {
        const remoteStream = new MediaStream(remoteTracks);
        startSpeechToText(remoteStream, false);
      }

      remoteTracks.forEach((track) => {
        combinedStream.addTrack(track);
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      const localSource = audioContext.createMediaStreamSource(micStream);
      localSource.connect(destination);

      if (remoteTracks.length > 0) {
        const remoteStream = new MediaStream(remoteTracks);
        const remoteSource = audioContext.createMediaStreamSource(remoteStream);
        remoteSource.connect(destination);
      }

      const recorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm',
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    stopSpeechToText(true);
    stopSpeechToText(false);
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        chunks.current = [];

        convertToWav(blob).then((wavBlob) => {
          const audioUrl = URL.createObjectURL(wavBlob);
          const audioLink = document.createElement('a');
          audioLink.href = audioUrl;
          audioLink.download = `call-recording-${new Date().toISOString()}.wav`;
          audioLink.click();
          URL.revokeObjectURL(audioUrl);
        });
      };
    }
  };

  const eventHandlers = {
    failed: function (e) {
      setStatus('fail');
      setPhoneNumber('');
      if (isRecording) {
        stopRecording();
      }
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], status: 'Fail', start: 0, end: 0 }]);
    },

    confirmed: function (e) {
      reset();
      startRecording();
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
      if (isRecording) {
        stopRecording();
      }
      console.log('call ended');
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
      pause();
      setStatus('start');
      setPhoneNumber('');
    },
  };

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

  const encodeWAV = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
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

  const writeString = (dataView, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      dataView.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  var options = {
    eventHandlers: eventHandlers,
    mediaConstraints: {
      audio: {
        mandatory: {
          echoCancellation: true,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
        },
      },
    },
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
    const initializeJsSIP = () => {
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

        ua?.on('newMessage', (e) => {
          console.log('Message event:', e);
          connectioncheck();
        });

        ua.on('registered', (data) => {
          console.log('Successfully registered:', data);
        });

        ua.on('registrationFailed', (data) => {
          console.error('Registration failed:', data);
        });
        ua.on('stopped', (e) => {
          console.error('stopped', e);
        });

        ua.on('newRTCSession', function (e) {
          console.log('Session Direction:', e.session.direction);

          if (e.session.direction === 'incoming') {
            handleIncomingCall(e.session, e.request);
          } else {
            setSession(e.session);
            e.session.connection.addEventListener('addstream', (event) => {
              audioRef.current.srcObject = event.stream;
            });
          }
        });

        setUa(ua);
      } catch (error) {
        console.error('Error initializing JsSIP:', error);
        toast.error('You Are Logout');
        navigate('/webphone/login');
      }
    };

    const handleIncomingCall = (session, request) => {
      const incomingNumber = request.from._uri._user;

      // Automatically answer the call
      session.answer(options);

      // Set up the call screen
      setSession(session);
      setStatus('calling');
      reset();

      // Update call history
      setHistory((prev) => [
        ...prev,
        {
          phoneNumber: incomingNumber,
          type: 'incoming',
          status: 'Success',
          start: new Date().getTime(),
          startTime: new Date(),
        },
      ]);

      // Set up audio stream
      session.connection.addEventListener('addstream', (event) => {
        audioRef.current.srcObject = event.stream;
      });

      // Handle call ending
      session.once('ended', () => {
        setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
        pause();
        setStatus('start');
        setPhoneNumber('');
        setDispositionModal(true);
      });

      // Handle call failure
      session.once('failed', () => {
        setHistory((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], end: new Date().getTime(), status: 'Fail' },
        ]);
        pause();
        setStatus('start');
        setPhoneNumber('');
      });

      // Get user call data
      answercall();
    };

    const handleCallFailed = () => {
      setHistory((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], end: new Date().getTime(), status: 'Fail' },
      ]);
      pause();
      setStatus('start');
      setPhoneNumber('');
    };

    const handleActiveCall = (session, number) => {
      setSession(session);
      reset();
      setStatus('calling');
      localStorage.setItem('dialing', false);
      answercall();
      setHistory((prev) => [
        ...prev,
        {
          phoneNumber: number,
          type: 'incoming',
          status: 'Success',
          start: new Date().getTime(),
          startTime: new Date(),
        },
      ]);

      session.connection.addEventListener('addstream', (event) => {
        audioRef.current.srcObject = event.stream;
      });

      session.once('ended', () => {
        console.log('Call ended');
        handleCallEnded();
      });
    };

    const handleCallEnded = () => {
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
      pause();
      setStatus('start');
      setPhoneNumber('');
      setDispositionModal(true);
    };

    const enumerateDevices = async () => {
      try {
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

    initializeJsSIP();
    enumerateDevices();

    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);

      // Clean up the "newMessage" event listener
      if (ua) {
        ua.off('newMessage');
      }
    };
  }, [username, password, navigate]);

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
        answercall();
      });
    }
  };
  return [
    conferenceStatus,
    reqUnHold,
    conferenceNumber,
    setConferenceNumber,
    createConferenceCall,
    toggleHold,
    isHeld,
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
    devices,
    selectedDeviceId,
    changeAudioDevice,
    isRecording,
    startRecording,
    stopRecording,
    bridgeID,
    dispositionModal,
    setDispositionModal,
    userCall,
  ];
};

export default useJssip;
