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
    <div className="flex flex-col items-center justify-center min-h-screen">
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
        <button
          className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
          onClick={() => {
            session.terminate();
          }}
        >
          <ImPhoneHangUp size={20} />
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
