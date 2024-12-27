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

            ua.on('newMessage', (e) => {
              console.log('message event:', e);
              connectionTime = Date.now();
              connectioncheck();
            });

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

      if (ua) {
        ua.off('newMessage');
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
                  userCall={userCall}
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
