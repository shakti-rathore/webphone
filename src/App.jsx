import './index.css';
import Home from './components/Home';
import CallScreen from './components/CallScreen';
import HistoryScreen from './components/HistoryScreen';
import useJssip from './hooks/useJssip';
import { useState, useEffect } from 'react';
import InCallScreen from './components/InCallScreen';

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
