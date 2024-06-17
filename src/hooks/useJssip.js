import { useContext, useEffect, useState, useRef } from "react";
import HistoryContext from "../context/HistoryContext";

import { useStopwatch } from "react-timer-hook";
import JsSIP from "jssip";

const useJssip = () => {
  const audioRef = useRef();
  const { setHistory } = useContext(HistoryContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ua, setUa] = useState(null);
  const [session, setSession] = useState(null);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [status, setStatus] = useState("start");
  const { seconds, minutes, isRunning, pause, reset } = useStopwatch({
    autoStart: false,
  });

  var eventHandlers = {
    failed: function (e) {
      setStatus("fail");
      setPhoneNumber("");
      setHistory((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], status: "Fail", start: 0, end: 0 },
      ]);
    },

    ended: function (e) {
      console.log("call ended");
      setHistory((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], end: new Date().getTime() },
      ]);

      pause();
      setStatus("start");
      setPhoneNumber("");
    },

    confirmed: function (e) {
      reset();
      setHistory((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          status: "Success",
          start: new Date().getTime(),
        },
      ]);
    },
  };

  var options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true },
  };

  useEffect(() => {
    try {
      var socket = new JsSIP.WebSocketInterface("wss://samwad.iotcom.io:8089/ws");
      var configuration = {
        sockets: [socket],
        session_timers: false,
        uri: "demo-surya@samwad.iotcom.io:8089",
        password: "Demo@123",
      };
      var ua = new JsSIP.UA(configuration);
      ua.start();
      ua.on("newRTCSession", function (e) {
        console.log(e.session.direction);
        console.log(e.session);
        console.log(e.session.direction);
        if (e.session.direction === "incoming") {
          e.session.answer();
          setSession(e.session);
          setPhoneNumber("800");
          reset();
          setStatus("calling");
          
      setHistory((prev) => {
        return    [
          ...prev,
          {
            phoneNumber:"800",
            type : "incoming",
            status: "Success",
            start: new Date().getTime(),
            startTime : new Date (),
          },
        ]

      }  );

          e.session.connection.addEventListener("addstream", (event) => {
            audioRef.current.srcObject = event.stream;
          });
          e.session.once("ended", (e) => {
            console.log("Call ended local event");
            setHistory((prev) => [
              ...prev.slice(0, -1),
              { ...prev[prev.length - 1], end: new Date().getTime() },
            ]);
      
            pause();
            setStatus("start");
            setPhoneNumber("");
           
          });

        }else{
          setSession(e.session);
          e.session.connection.addEventListener("addstream", (event) => {
            audioRef.current.srcObject = event.stream;
          });
        }
      
       
       
      });

      setUa(ua);
    } catch (e) {
      console.error(e);
    }
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
      ua.call(phoneNumber.replace(" ", ""), options);
      setStatus("calling");
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
    speakerOff,
    setSpeakerOff,
    isRunning,
    audioRef,
  ];
};

export default useJssip;
