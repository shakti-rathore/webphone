import './index.css';
import Home from './components/Home';
import CallScreen from './components/CallScreen';
import HistoryScreen from './components/HistoryScreen';
import useJssip from './hooks/useJssip';
import { useState, useEffect } from 'react';
import InCallScreen from './components/InCallScreen';
import { LocalNotifications } from '@capacitor/local-notifications';

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

  useEffect(() => {
    if (status === 'Incalling') {
      const scheduleNotification = async () => {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Incoming Call',
              body: 'You have an incoming call!',
              id: 2,
              sound: 'default',
            },
          ],
        });
      };

      scheduleNotification();
    }
  }, [status]);

  useEffect(() => {
    const handleNotificationClick = (notification) => {
      console.log('Notification clicked:', notification);
    };

    const notificationListener = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      handleNotificationClick
    );

    return () => {
      notificationListener.remove();
    };
  }, []);

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
        <div>Nothing</div>
      )}
      <audio ref={audioRef} autoPlay hidden={true} />
    </div>
  );
}

export default App;
