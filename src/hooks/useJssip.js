import { useContext, useEffect, useState, useRef } from "react";
import HistoryContext from "../context/HistoryContext";
import { useNavigate } from 'react-router-dom';

import { useStopwatch } from "react-timer-hook";
import JsSIP from "jssip";

const useJssip = () => {
  const audioRef = useRef();
  const { setHistory, username, password } = useContext(HistoryContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ua, setUa] = useState(null);
  const [session, setSession] = useState(null);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [status, setStatus] = useState("start");
  const { seconds, minutes, isRunning, pause, reset } = useStopwatch({
    autoStart: false,
  });
  const navigate = useNavigate();

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
      var socket = new JsSIP.WebSocketInterface(
        "wss://samwad.iotcom.io:8089/ws"
      );
      var configuration = {
        sockets: [socket],
        session_timers: false,
        uri: `${(username).replace("@", "-")}@samwad.iotcom.io:8089`,
        password: password,
      };
      var ua = new JsSIP.UA(configuration);
      ua.start();
      ua.on("newRTCSession", function (e) {
        console.log(e.session.direction);
        console.log(e.session);
        console.log(e.session.direction);
        if (e.session.direction === "incoming") {
          const incomingnumber = e.request.from._uri._user;
          if (true) {
            console.log("handle  fresh incoming call ");
            setStatus("Incalling");
            setSession(e.session);
            reset();
            setHistory((prev) => {
              setPhoneNumber(incomingnumber);
              console.log("phoneNUmber", incomingnumber);
              return [
                ...prev,
                {
                  phoneNumber: incomingnumber,
                  type: "incoming",
                  status: "Success",
                  start: new Date().getTime(),
                  startTime: new Date(),
                },
              ];
            });
          } else {
            e.session.answer();
            setSession(e.session);
            reset();
            setStatus("calling");
    
            setHistory((prev) => {
              setPhoneNumber(incomingnumber);
              console.log("phoneNUmber", incomingnumber);
              return [
                ...prev,
                {
                  phoneNumber: incomingnumber,
                  type: "incoming",
                  status: "Success",
                  start: new Date().getTime(),
                  startTime: new Date(),
                },
              ];
            });
    
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
          }
        } else {
          setSession(e.session);
          e.session.connection.addEventListener("addstream", (event) => {
            audioRef.current.srcObject = event.stream;
          });
        }
    
      });

      setUa(ua);
    } catch (e) {
      console.error(e);
      navigate("/login")
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
      //ua.call(phoneNumber.replace(" ", ""), options);

      fetch(`https://samwad.iotcom.io/dialnumber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ caller: username, receiver: phoneNumber })
      }).then(() => { console.log("dail api called") });

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
    setStatus,
  ];
};

export default useJssip;
