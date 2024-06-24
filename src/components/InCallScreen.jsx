import { BsPersonFill, BsMicMute, BsX } from 'react-icons/bs';
import { IoIosKeypad } from 'react-icons/io';
import { IoCloseCircleOutline, IoCloseCircle, IoVolumeMuteSharp } from 'react-icons/io5';
import { ImPhoneHangUp } from 'react-icons/im';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';
import { useState, useRef, useContext } from 'react';
import KeyPad from './KeyPad';
import HistoryContext from '../context/HistoryContext';
import { useStopwatch } from 'react-timer-hook';

const InCallScreen = ({
  setPhoneNumber,
  phoneNumber,
  session,
  speakerOff,
  setSpeakerOff,
  seconds,
  minutes,
  isRunning,
  setStatus,
}) => {
  const [currNum, setCurrNum] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showKeyPad, setShowKeyPad] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRefIn = useRef();
  const { setHistory, username } = useContext(HistoryContext);
  const [isRinging, setIsRinging] = useState(true);
  const { pause } = useStopwatch({
    autoStart: false,
  });

  const formatPhoneNumber = useFormatPhoneNumber();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <audio id="ringtoneII" autoPlay hidden={true} src="ringtone.mp3" />
      <div className="flex flex-col items-center w-full max-w-72 p-6 bg-white rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)]">
        <div className={`flex flex-col items-center ${showKeyPad ? '' : 'mb-24'}`}>
          <div className="w-12 h-12 rounded-full bg-blue-dark flex items-center justify-center mb-4">
            <BsPersonFill className="text-white text-2xl" />
          </div>
          <div className="text-2xl font-bold text-blue-dark mb-2">{formatPhoneNumber(phoneNumber)}</div>
          {!isRunning ? (
            <span className="text-gray-500">Calling...</span>
          ) : (
            <span className="text-gray-500">
              {minutes} : {seconds}
            </span>
          )}
        </div>
        <div className="w-full">
          {!showKeyPad ? (
            <div className="flex justify-around mb-6">
              <button
                className={`p-4 rounded-full ${speakerOff ? 'bg-blue-dark text-white' : 'text-gray-600'}`}
                onClick={() => setSpeakerOff(!speakerOff)}
              >
                <IoVolumeMuteSharp className="text-3xl" />
              </button>
              <button
                className={`p-4 rounded-full ${muted ? 'bg-blue-dark text-white' : 'text-gray-600'}`}
                onClick={() => {
                  muted ? session.unmute() : session.mute();
                  setMuted(!muted);
                }}
              >
                <BsMicMute className="text-3xl" />
              </button>
              <button className="p-4 text-gray-600 rounded-full" onClick={() => setShowKeyPad(true)}>
                <IoIosKeypad className="text-3xl" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4 relative">
              <div className="text-xl font-bold text-blue-dark mb-2">{currNum}</div>
              <KeyPad setPhoneNumber={setCurrNum} />
              <div
                className="flex items-center justify-center mt-4 text-blue-dark cursor-pointer absolute -top-6 right-1"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {
                  setCurrNum('');
                  setShowKeyPad(false);
                }}
              >
                {isHovered ? <IoCloseCircle className="text-3xl" /> : <IoCloseCircleOutline className="text-3xl" />}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-12">
          <button
            className={`p-4 ${
              isRinging ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
            } text-white rounded-full animate-ping focus:outline-none`}
            onClick={() => {
              if (isRinging) {
                console.log('call answer button clicked');
                document.getElementById('ringtoneII').pause();
                document.getElementById('ringtoneII').currentTime = 0;
                session.answer();
                setIsRinging(false);
                session.connection.addEventListener('addstream', (event) => {
                  audioRefIn.current.srcObject = event.stream;
                });
                session.once('ended', (e) => {
                  console.log('Call ended local event');
                  setHistory((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], end: new Date().getTime() }]);
                  pause();
                  setStatus('start');
                  setPhoneNumber('');
                  fetch(`https://samwad.iotcom.io/user/callended${username}`, {
                    method: 'POST',
                  }).then(() => {
                    console.log('call ended API Called');
                    fetch(`https://samwad.iotcom.io/user/disposition${username}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        //"Authorization": `Bearer ${localStorage.getItem('jwtToken')}`
                      },
                      body: JSON.stringify({
                        bridgeID: 'web-phone-test',
                        Disposition: 'Webponecall',
                      }),
                    }).then(() => {
                      console.log('dispo req send to server');
                    });
                  });
                });
              }
            }}
          >
            {isRinging && <ImPhoneHangUp size={20} />}
          </button>

          <button
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full focus:outline-none"
            onClick={() => {
              console.log('button clicked to end call');
              session.terminate();
            }}
          >
            <BsX size={20} />
          </button>
        </div>
      </div>
      <audio ref={audioRefIn} autoPlay hidden={true} muted={speakerOff} />
    </div>
  );
};

export default InCallScreen;
