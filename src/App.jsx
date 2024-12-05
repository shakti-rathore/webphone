import './index.css';
import Home from './components/Home';
import CallScreen from './components/CallScreen';
import HistoryScreen from './components/HistoryScreen';
import useJssip from './hooks/useJssip';
import { useState, useEffect, useRef, useContext } from 'react';
import InCallScreen from './components/InCallScreen';
import HistoryContext from './context/HistoryContext';
import CallConference from './components/CallConference';

function App() {
  const [
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
    setBridgeID,
    devices,
    selectedDeviceId,
    changeAudioDevice,
    isRecording,
    startRecording,
    stopRecording,
  ] = useJssip();
  const [seeLogs, setSeeLogs] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [callConference, setCallConference] = useState(false);
  const [timeoutArray, setTimeoutArray] = useState([]);
  const keepAliveRef = useRef(null);
  const { username } = useContext(HistoryContext);

  useEffect(() => {
    if (status == 'start') {
      stopRecording();
    }
  }, [status]);

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
            setTimeout(() => {
              reject(new Error('Timeout'));
            }, 3000);
          }),
        ]);

        if (response.status === 401) {
          window.location.href = '/login';
        } else {
          const data = await response.json();
          if (data.message === 'ok connection for user') {
            setTimeoutArray([]);
          } else if (data.message === 'poor connection problem ,please login again') {
            setIsLogin(false);
            clearInterval(keepAliveRef.current);
          }
        }
      } catch (err) {
        if (err.message === 'Timeout') {
          const timeout = { timeout: true };
          const newTimeoutArray = [...timeoutArray, timeout];
          setTimeoutArray(newTimeoutArray);

          if (newTimeoutArray.length > 2) {
            setIsLogin(false);
            clearInterval(keepAliveRef.current);
          }
        } else {
          console.error('Error during connection check:', err);
        }
      }
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
              connectioncheck();
            }, 5000);
          }
        })
        .catch((error) => {
          console.error('Error sending login request:', error);
        });
    }

    return () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
      }
    };
  }, [username]);

  function handleCalls() {
    createConferenceCall();
    setCallConference(false);
    setConferenceNumber('');
  }

  return (
    <div className="App">
      {seeLogs ? (
        <HistoryScreen setSeeLogs={setSeeLogs} />
      ) : status === 'start' ? (
        <Home
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          handleCall={handleCall}
          setSeeLogs={setSeeLogs}
        />
      ) : status === 'calling' || status === 'conference' ? (
        <>
          {(callConference && (
            <CallConference
              conferenceNumber={conferenceNumber}
              setCallConference={setCallConference}
              setConferenceNumber={setConferenceNumber}
              handleCall={handleCalls}
              setSeeLogs={setSeeLogs}
              phoneNumber={phoneNumber}
            />
          )) || (
            <CallScreen
              reqUnHold={reqUnHold}
              setCallConference={setCallConference}
              toggleHold={toggleHold}
              isHeld={isHeld}
              isRecording={isRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              phoneNumber={phoneNumber}
              session={session}
              seconds={seconds < 10 ? `0${seconds}` : `${seconds}`}
              minutes={minutes < 10 ? `0${minutes}` : `${minutes}`}
              isRunning={isRunning}
              setBridgeID={setBridgeID}
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              changeAudioDevice={changeAudioDevice}
              conferenceStatus={conferenceStatus}
            />
          )}
        </>
      ) : status === 'Incalling' ? (
        <InCallScreen
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          phoneNumber={phoneNumber}
          session={session}
          setPhoneNumber={setPhoneNumber}
          seconds={seconds < 10 ? `0${seconds}` : `${seconds}`}
          minutes={minutes < 10 ? `0${minutes}` : `${minutes}`}
          isRunning={isRunning}
          setStatus={setStatus}
          audioRef={audioRef}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
        />
      ) : (
        <div>No content available</div>
      )}
      <audio ref={audioRef} autoPlay hidden />
    </div>
  );
}

export default App;
