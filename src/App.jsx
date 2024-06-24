import "./index.css";
import Home from "./components/Home";
import CallScreen from "./components/CallScreen";
import HistoryScreen from "./components/HistoryScreen";
import useJssip from "./hooks/useJssip";
import { useState } from "react";
import  InCallScreen from "./components/InCallScreen";

function App() {
  const [
    seconds,
    minutes,
    status,
    phoneNumber,
    setPhoneNumber,
    handleCall,
    session,
    speakerOff,
    setSpeakerOff,
    isRunning,
    audioRef,
    setStatus
  ] = useJssip();
  const [seeLogs, setSeeLogs] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const secondTime = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const minuteTime = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return (
    <div className="App">
      {seeLogs ? (
        <HistoryScreen setSeeLogs={setSeeLogs} />
      ) : status ==="start" ? (
        <Home
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          handleCall={handleCall}
          setSeeLogs={setSeeLogs}
        />
      ) : status === "calling" ? (
        <CallScreen
          phoneNumber={phoneNumber}
          session={session}
          speakerOff={speakerOff}
          setSpeakerOff={setSpeakerOff}
          seconds={secondTime}
          minutes={minuteTime}
          isRunning={isRunning}
        />
      ) : status === "Incalling" ? (
        <InCallScreen
      phoneNumber={phoneNumber}
      session={session}
      speakerOff={speakerOff}
      setSpeakerOff={setSpeakerOff}
      setPhoneNumber={setPhoneNumber}
      seconds={secondTime}
      minutes={minuteTime}
      isRunning={isRunning}
      setStatus={setStatus}
      />): <div>
        Nothing 
      </div>
      
      }
      <audio ref={audioRef} autoPlay hidden={true} muted={speakerOff} />
    </div>
  );
}

export default App;
