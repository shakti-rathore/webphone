import "./Incall-screen.scss";
import { BsPersonFill, BsMicMute } from "react-icons/bs";
import { IoIosKeypad } from "react-icons/io";
import {
  IoCloseCircleOutline,
  IoCloseCircle,
  IoVolumeMuteSharp,
} from "react-icons/io5";
import { ImPhoneHangUp } from "react-icons/im";
import useFormatPhoneNumber from "../../hooks/useFormatPhoneNumber";
import { useState,useContext,useRef } from "react";
import KeyPad from "../key-pad/KeyPad";
import HistoryContext from "../../context/HistoryContext";
import { useStopwatch } from "react-timer-hook";


const InCallScreen = ({
  phoneNumber,
  setPhoneNumber,
  session,
  speakerOff,
  setSpeakerOff,
  seconds,
  minutes,
  isRunning,
  setStatus
}) => {
  const [currNum, setCurrNum] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [showKeyPad, setShowKeyPad] = useState(false);
  const [muted, setMuted] = useState(false);
  const { setHistory,username } = useContext(HistoryContext);
  const audioRefIn = useRef();
  const { pause } = useStopwatch({
    autoStart: false,
  });
  const formatPhoneNumber = useFormatPhoneNumber();
  const [isRinging, setIsRinging] = useState(true);
  //audioRefIn.current.srcObject = "ringtone.mp3";

  return (
    <div className="call-container">
      <audio id="ringtoneII" autoPlay hidden={true} src="ringtone.mp3" />
      <div className="call-top">
        <div className="avatar">
          <BsPersonFill className="person-icon" />
        </div>
        <div className="phone-number">{formatPhoneNumber(phoneNumber)}</div>
        {!isRunning ? (
          <span className="status">Calling...</span>
        ) : (
          <span className="status">{minutes + " : " + seconds}</span>
        )}
      </div>
      <div className="call-bottom">
        {!showKeyPad ? (
          <div className="actions">
            <span
              className={speakerOff ? "actions-item active" : "actions-item"}
              onClick={() => {
                setSpeakerOff(!speakerOff);
              }}
            >
              <IoVolumeMuteSharp className="actions-icon" />
            </span>
            <span
              className={muted ? "actions-item active" : "actions-item"}
              onClick={() => {
                muted ? session.unmute() : session.mute();
                setMuted(!muted);
              }}
            >
              <BsMicMute className="actions-icon" />
            </span>
            <span
              className="actions-item"
              onClick={() => {
                setShowKeyPad(true);
              }}
            >
              <IoIosKeypad className="actions-icon" />
            </span>
          </div>
        ) : (
          <div className="keypad">
            <div className="phone-number">{currNum}</div>
            <KeyPad setPhoneNumber={setCurrNum} />
            <div
              className="close-icon"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
              }}
              onClick={() => {
                setCurrNum("");
                setShowKeyPad(false);
              }}
            >
              {isHovered ? <IoCloseCircle /> : <IoCloseCircleOutline />}
            </div>
          </div>
        )}
        <button
          className={isRinging ? 'call-btn' : 'cancel'}
          onClick={() => {
            
            if(isRinging) {
            console.log("button clicked to answer call"); 
            document.getElementById("ringtoneII").pause();
            document.getElementById("ringtoneII").currentTime = 0;
            session.answer();
            setIsRinging(false);
            session.connection.addEventListener("addstream", (event) => {
              audioRefIn.current.srcObject = event.stream;
            });
            session.once("ended", (e) => {
              console.log("Call ended local event");
              setHistory((prev) => [
                ...prev.slice(0, -1),
                { ...prev[prev.length - 1], end: new Date().getTime() },
              ]);  
              pause();
              setStatus("start");
              setPhoneNumber("");
              fetch(`https://samwad.iotcom.io/user/callended${username}`, {
                method: 'POST',
              }).then(()=>{
                console.log("call ended API Called");
                fetch(`https://samwad.iotcom.io/user/disposition${username}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    //"Authorization": `Bearer ${localStorage.getItem('jwtToken')}`
                  },
                  body: JSON.stringify({
                    bridgeID: "web-phone-test",
                    Disposition : "Webponecall"
                }),
                }).then(()=>{console.log("dispo req send to server")});
              });
            });
          } else {
            console.log("button clicked to answer call")
            session.terminate();
            
          }
          }}
        >
          <ImPhoneHangUp className="cancle-icon" />
        </button>
      </div>

      <audio ref={audioRefIn} autoPlay hidden={true} muted={speakerOff} />
      {/* <audio id="ringtone" autoPlay hidden={true} src="ringtone.mp3" /> */}

    </div>
  );
};

export default InCallScreen;
