import React, { useState, useEffect, useRef, useContext } from 'react';
import HistoryContext from '../context/HistoryContext';
import { useNavigate } from 'react-router-dom';
import { useStopwatch } from 'react-timer-hook';
import JsSIP from 'jssip';
import { LocalNotifications } from '@capacitor/local-notifications';
import { startspeechToText, stopSpeechTotext } from './sppechtotext';
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
  const [isRecording, setIsRecording] = useState(false);
  const [agentText, setAgentText] = useState('');
  const [customerText, setCustomerText] = useState('');
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

  const initializeWebSocketTranscription = () => {
    const createWebSocket = (isAgent = true) => {
      const socketRef = isAgent ? agentSocketRef : customerSocketRef;
      const setTextFunction = isAgent ? setAgentText : setCustomerText;

      const socket = new WebSocket('wss://callapp.iotcom.io/socket');
      socketRef.current = socket;

      socket.onopen = () => {
        console.log(`${isAgent ? 'Agent' : 'Customer'} WebSocket Connected`);
      };

      socket.onerror = (error) => {
        console.error(`${isAgent ? 'Agent' : 'Customer'} WebSocket Error:`, error);
      };

      socket.onclose = () => {
        console.log(`${isAgent ? 'Agent' : 'Customer'} WebSocket Closed`);
        // Attempt to reconnect after a short delay
        setTimeout(() => {
          createWebSocket(isAgent);
        }, 3000);
      };

      socket.onmessage = (msg) => {
        try {
          const text = JSON.parse(msg.data);
          console.log('text data message from web socket: ', text);

          if (text.isFixed === 'true' || text.isFixed === true) {
            setTextFunction((prev) => prev + text.data);
          } else {
            setTextFunction((prev) => prev + text.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      return socket;
    };

    // Create both agent and customer WebSockets
    createWebSocket(true); // Agent WebSocket
    createWebSocket(false); // Customer WebSocket
  };

  const startSpeechToText = (stream, isAgent = true) => {
    const websocket = isAgent ? agentSocketRef.current : customerSocketRef.current;
    const mediaRecorderRef = isAgent ? agentMediaRecorderRef : customerMediaRecorderRef;

    // Check WebSocket state with more robust connection checking
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      console.log(`${isAgent ? 'Agent' : 'Customer'} WebSocket not ready. Current state: ${websocket?.readyState}`);

      // If the socket is closing or closed, attempt to reinitialize
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
    initializeWebSocketTranscription();

    return () => {
      // Properly close WebSockets on component unmount
      if (agentSocketRef.current) {
        agentSocketRef.current.close();
      }
      if (customerSocketRef.current) {
        customerSocketRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    if (!session || isRecording) return;

    try {
      const combinedStream = new MediaStream();

      // Get local microphone stream
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      });

      // Get remote audio tracks from the WebRTC session
      const remoteReceivers = session.connection.getReceivers() || [];
      const remoteTracks = remoteReceivers
        .filter((receiver) => receiver.track?.kind === 'audio')
        .map((receiver) => receiver.track)
        .filter(Boolean);

      // Start WebSocket transcription for both streams
      startSpeechToText(micStream, true); // Agent stream
      if (remoteTracks.length > 0) {
        const remoteStream = new MediaStream(remoteTracks);
        startSpeechToText(remoteStream, false); // Customer stream
      }

      // Add remote tracks to combined stream
      remoteTracks.forEach((track) => {
        combinedStream.addTrack(track);
      });

      // Create audio context for mixing streams
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      // Connect local microphone source
      const localSource = audioContext.createMediaStreamSource(micStream);
      localSource.connect(destination);

      // Connect remote audio source if available
      if (remoteTracks.length > 0) {
        const remoteStream = new MediaStream(remoteTracks);
        const remoteSource = audioContext.createMediaStreamSource(remoteStream);
        remoteSource.connect(destination);
      }

      // Setup recorder with combined stream
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

  // Modified stopRecording function
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

  // Event handlers now include recording management
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
      startRecording(); // Start recording when call is confirmed
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
        stopRecording(); // Stop recording and generate files when call ends
      }
      console.log('call ended');
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
      pause();
      setStatus('start');
      setPhoneNumber('');
    },
  };

  // Function to convert audio blob to WAV format
  const convertToWav = async (blob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const wavBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    // Copy the audio data to the new buffer
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      wavBuffer.copyToChannel(channelData, channel);
    }

    // Convert to WAV format
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
          // navigator.mediaDevices
          //   .getUserMedia({ audio: true })
          //   .then((stream) => {
          //     if (stream.getAudioTracks().length === 0) {
          //       throw new Error('No audio tracks available in the stream.');
          //     }
          //     console.log('Audio stream:', stream);

          //     // Pass the stream to startspeechToText
          //     const socket = agentSocketRef?.current;
          //     const { agentmediaRecorder, agentwebsocket, stop } = startspeechToText(stream, "Agent", socket);

          //     stream.oninactive = function () {
          //       console.log('Stream ended.');
          //       stop();
          //     };

          //     // localStream = stream;
          //   })
          //   .catch((err) => {
          //     console.error('Error accessing microphone:', err);
          //     // localStream = null;
          //   });

          if (isdialing === null || isdialing === 'false') {
            console.log('handle fresh incoming call');
            setStatus('Incalling');
            showIncomingCallNotification({ caller: incomingnumber });
            console.log('here stream is made');
            let localStream;
            // navigator.mediaDevices
            //   .getUserMedia({ audio: true })
            //   .then((stream) => {
            //     localStream = stream;
            //     console.log('stream is ', stream);

            //   })
            //   .catch((err) => {
            //     localStream = null;
            //     console.error('Error accessing microphone:', err);
            //   });

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
            console.log('e.session.direction is ', e.session.direction);
            e.session.answer();
            let localStream;
            // navigator.mediaDevices
            //   .getUserMedia({ audio: true })
            //   .then((stream) => {
            //     localStream = stream;
            //     console.log('stream is ', stream);
            //     console.log('web socket is ', agentSocketRef.current);
            //     const socket = agentSocketRef?.current;
            //     const { agentmediaRecorder, agentwebsocket, stop } = startspeechToText(stream, "Agent", socket);

            //     stream.oninactive = function () {
            //       console.log('Stream ended');
            //       stop();
            //       //stopSpeechTotext(agentmediaRecorder, agentwebsocket);                

            //     };

            //   })
            //   .catch((err) => {
            //     localStream = null;
            //     console.error('Error accessing microphone:', err);
            //   });
            if (e.session.connection) {
              e.session.connection.addEventListener('track', function (e) {
                console.log('remote stream added');
                console.log(e);
                const track = e.track;
                console.log('Using audio device: ' + track);
                const socket = agentSocketRef?.current;
                const { mediaRecorder, websocket, stop } = startspeechToText(e.streams[0], "Customer", socket);
                console.log("stop function", stop);
                e.streams[0].oninactive = function () {

                  console.log('Stream ended');
                  //console.log("stop agent speech to text");  
                  stop();
                  //stopSpeechTotext(mediaRecorder, websocket);
                  //console.log("stop customer speech to text");
                  //stopSpeechTotext(customermediaRecorder,customersocket);
                  agentText = "";
                  customerText = "";

                  // When the stream becomes inactive, stop the local stream
                  if (localStream) {
                    localStream.getTracks().forEach((track) => track.stop());
                  }
                };

                if (track.kind === 'audio') {
                  audioRef.current.srcObject = e.streams[0];
                } else {
                  // remotevideo.srcObject = e.streams[0];
                  console.log('track is not of type audio');

                  console.log('track.kind = ' + track.kind)
                }
              });
            } else {
              console.log(e.session?.connection);
              console.log(session);
              console.log("No connectionssss");

            }


            // e.session.answer();
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
    isRecording,
    startRecording,
    stopRecording,
  ];
};

export default useJssip;