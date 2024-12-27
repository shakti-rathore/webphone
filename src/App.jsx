import { useState, useEffect, useRef, useContext } from 'react';
import Home from './components/Home';
import CallScreen from './components/CallScreen';
import HistoryScreen from './components/HistoryScreen';
import useJssip from './hooks/useJssip';
import HistoryContext from './context/HistoryContext';
import CallConference from './components/CallConference';
import Disposition from './components/Disposition';
import AutoDial from './components/AutoDial';
import UserCall from './components/UserCall';

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
    ua,
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
          clearInterval(keepAliveRef.current);
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
        clearInterval(keepAliveRef.current);
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
    <div className="min-h-screen w-full">
      {dispositionModal && (
        <Disposition bridgeID={bridgeID} setDispositionModal={setDispositionModal} userCall={userCall} />
      )}

      <div className="w-full mx-auto bg-white dark:bg-black/50 rounded-lg shadow p-3">
        <div className="flex flex-col lg:flex-row items-center gap-5">
          {(status !== 'start' && userCall && (
            <div className="w-full lg:w-2/5">
              <UserCall userCall={userCall} username={username} />
            </div>
          )) || (
            <div className="w-full lg:w-2/5">
              <AutoDial setPhoneNumber={setPhoneNumber} dispositionModal={dispositionModal} />
            </div>
          )}

          <div className={`w-full ${status !== 'start' ? 'lg:w-2/3' : ''}`}>
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
              callConference ? (
                <CallConference
                  conferenceNumber={conferenceNumber}
                  setCallConference={setCallConference}
                  setConferenceNumber={setConferenceNumber}
                  handleCall={handleCalls}
                  setSeeLogs={setSeeLogs}
                  phoneNumber={phoneNumber}
                />
              ) : (
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
                  devices={devices}
                  selectedDeviceId={selectedDeviceId}
                  changeAudioDevice={changeAudioDevice}
                  conferenceStatus={conferenceStatus}
                />
              )
            ) : status === 'Incalling' ? (
              <></>
            ) : (
              <div className="text-center p-4">No content available</div>
            )}
          </div>
        </div>

        <audio ref={audioRef} autoPlay hidden />
      </div>
    </div>
  );
}

export default App;
