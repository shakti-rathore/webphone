import { BsPersonFill, BsMicMute } from 'react-icons/bs';
import { IoIosKeypad } from 'react-icons/io';
import { IoCloseCircleOutline, IoCloseCircle, IoVolumeMuteSharp } from 'react-icons/io5';
import { ImPhoneHangUp } from 'react-icons/im';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';
import { useState } from 'react';
import KeyPad from './KeyPad';

const CallScreen = ({ phoneNumber, session, speakerOff, setSpeakerOff, seconds, minutes, isRunning }) => {
  const [currNum, setCurrNum] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showKeyPad, setShowKeyPad] = useState(false);
  const [muted, setMuted] = useState(false);

  const formatPhoneNumber = useFormatPhoneNumber();
  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50 p-4">
      <div className="flex flex-col items-center w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-teal-dark flex items-center justify-center mb-4">
            <BsPersonFill className="text-white text-4xl" />
          </div>
          <div className="text-2xl font-bold text-teal-dark mb-2">{formatPhoneNumber(phoneNumber)}</div>
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
                className={`p-4 rounded-full ${speakerOff ? 'bg-teal-dark text-white' : 'bg-gray-200 text-teal-dark'}`}
                onClick={() => setSpeakerOff(!speakerOff)}
              >
                <IoVolumeMuteSharp className="text-3xl" />
              </button>
              <button
                className={`p-4 rounded-full ${muted ? 'bg-teal-dark text-white' : 'bg-gray-200 text-teal-dark'}`}
                onClick={() => {
                  muted ? session.unmute() : session.mute();
                  setMuted(!muted);
                }}
              >
                <BsMicMute className="text-3xl" />
              </button>
              <button className="p-4 bg-gray-200 text-teal-dark rounded-full" onClick={() => setShowKeyPad(true)}>
                <IoIosKeypad className="text-3xl" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <div className="text-xl font-bold text-teal-dark mb-2">{currNum}</div>
              <KeyPad setPhoneNumber={setCurrNum} />
              <div
                className="flex items-center justify-center mt-4 text-teal-dark cursor-pointer"
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
        <button
          className="mt-6 p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
          onClick={() => {
            console.log('button clicked');
            session.terminate();
          }}
        >
          <ImPhoneHangUp className="text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
