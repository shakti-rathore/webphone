import './index.css';
import Home from './components/Home';
import CallScreen from './components/CallScreen';
import HistoryScreen from './components/HistoryScreen';
import useJssip from './hooks/useJssip';
import { useState, useEffect, useRef, useContext } from 'react';
import InCallScreen from './components/InCallScreen';
import { LocalNotifications } from '@capacitor/local-notifications';
import HistoryContext from './context/HistoryContext';

function App() {
  const [
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
    scheduleNotification,
  ] = useJssip();

  const [seeLogs, setSeeLogs] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const secondTime = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const minuteTime = minutes < 10 ? `0${minutes}` : `${minutes}`;

  useEffect(() => {
    const requestPermissions = async () => {
      const result = await LocalNotifications.requestPermissions();
      if (result.receive === 'granted') {
        console.log('Notification permissions granted.');
      }
    };

    requestPermissions();
  }, []);

  const keepAliveRef = useRef(null);
  const { username } = useContext(HistoryContext);

  useEffect(() => {
    if (username) {
      const url = `https://awsdev.iotcom.io/userready/${username}`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === 'success') {
            console.log('user ready to take call');
            keepAliveRef.current = setInterval(() => {
              fetch('https://awsdev.iotcom.io/userconnection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: username }),
              }).then(() => {});
            }, 2000);
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
      ) : status === 'calling' ? (
        <CallScreen
          phoneNumber={phoneNumber}
          session={session}
          seconds={secondTime}
          minutes={minuteTime}
          isRunning={isRunning}
          setBridgeID={setBridgeID}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          changeAudioDevice={changeAudioDevice}
        />
      ) : status === 'Incalling' ? (
        <InCallScreen
          phoneNumber={phoneNumber}
          session={session}
          setPhoneNumber={setPhoneNumber}
          seconds={secondTime}
          minutes={minuteTime}
          isRunning={isRunning}
          setStatus={setStatus}
          audioRef={audioRef}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
        />
      ) : (
        <div>No content available</div> // Improved empty state handling
      )}
      <audio ref={audioRef} autoPlay hidden />
    </div>
  );
}

export default App;
