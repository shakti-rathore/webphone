import React, { useState, useEffect, useRef, useContext } from 'react';
import HistoryContext from '../context/HistoryContext';
import { useNavigate } from 'react-router-dom';
import { useStopwatch } from 'react-timer-hook';
import JsSIP from 'jssip';

const useJssip = () => {
  const audioRef = useRef();
  const { setHistory, username, password } = useContext(HistoryContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ua, setUa] = useState(null);
  const [session, setSession] = useState(null);
  const [bridgeID, setBridgeID] = useState('');
  const [speakerOff, setSpeakerOff] = useState(false);
  const [status, setStatus] = useState('start');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const { seconds, minutes, isRunning, pause, reset } = useStopwatch({
    autoStart: false,
  });
  const navigate = useNavigate();

  var eventHandlers = {
    failed: function (e) {
      setStatus('fail');
      setPhoneNumber('');
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], status: 'Fail', start: 0, end: 0 }]);
    },

    ended: function (e) {
      console.log('call ended');
      setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);

      pause();
      setStatus('start');
      setPhoneNumber('');
    },

    confirmed: function (e) {
      reset();
      setHistory((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          status: 'Success',
          start: new Date().getTime(),
        },
      ]);
    },
  };

  var options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true },
  };

  const changeAudioDevice = async (deviceId) => {
    setSelectedDeviceId(deviceId);
    if (session) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } }
        });
        session.connection.getSenders()[0].replaceTrack(stream.getAudioTracks()[0]);
      } catch (error) {
        console.error('Error changing audio device:', error);
      }
    }
  };

  useEffect(() => {
    try {
      var socket = new JsSIP.WebSocketInterface('wss://awsdev.iotcom.io:8089/ws');
      var configuration = {
        sockets: [socket],
        session_timers: false,
        uri: `${username.replace('@', '-')}@awsdev.iotcom.io:8089`,
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
              fetch(`https://awsdev.iotcom.io/user/callended${username}`, {
                method: 'POST',
              }).then(() => {
                console.log('call ended API Called');
                fetch(`https://awsdev.iotcom.io/user/disposition${username}`, {
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
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
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
    setSpeakerOff(false);
    if (phoneNumber) {
      setHistory((prev) => [
        ...prev,
        {
          startTime: new Date(),
          phoneNumber,
        },
      ]);
      localStorage.setItem('dialing', true);

      fetch(`https://awsdev.iotcom.io/dialnumber`, {
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

  const changeAudioOutput = (deviceId) => {
    if (audioRef.current && typeof audioRef.current.setSinkId === 'function') {
      audioRef.current
        .setSinkId(deviceId)
        .then(() => {
          setSelectedDeviceId(deviceId);
        })
        .catch((error) => console.error('Error setting sinkId:', error));
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
