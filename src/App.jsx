import "./App.scss";
import Home from "./components/home/Home";
import CallScreen from "./components/call-screen/CallScreen";
import HistoryScreen from "./components/history-screen/HistoryScreen";
import useJssip from "./hooks/useJssip";
import { useState } from "react";
import Login  from "./components/home/Login";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

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
  ] = useJssip();
  const [seeLogs, setSeeLogs] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const secondTime = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const minuteTime = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={
           <div className="App">
           {      
           seeLogs ? (
             <HistoryScreen setSeeLogs={setSeeLogs} />
           ) : status !== "calling" ? (
             <Home
               phoneNumber={phoneNumber}
               setPhoneNumber={setPhoneNumber}
               handleCall={handleCall}
               setSeeLogs={setSeeLogs}
             />
           ) : (
             <CallScreen
               phoneNumber={phoneNumber}
               session={session}
               speakerOff={speakerOff}
               setSpeakerOff={setSpeakerOff}
               seconds={secondTime}
               minutes={minuteTime}
               isRunning={isRunning}
             />
           )}
           <audio ref={audioRef} autoPlay hidden={true} muted={speakerOff} />
         </div>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>

   
  );
}

export default App;
