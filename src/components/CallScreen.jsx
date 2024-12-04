import { BsPersonFill, BsMicMute, BsPause, BsCameraVideo, BsPersonPlus } from 'react-icons/bs';
import { IoIosKeypad } from 'react-icons/io';
import { IoCloseCircleOutline, IoCloseCircle } from 'react-icons/io5';
import { ImPhoneHangUp } from 'react-icons/im';
import { FaStopCircle } from 'react-icons/fa';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';
import { useState } from 'react';
import KeyPad from './KeyPad';
import { MdCallMerge } from 'react-icons/md';

const CallScreen = ({
  reqUnHold,
  toggleHold,
  isHeld,
  phoneNumber,
  session,
  seconds,
  minutes,
  isRunning,
  devices,
  selectedDeviceId,
  changeAudioDevice,
  isRecording,
  startRecording,
  stopRecording,
  setCallConference,
  conferenceStatus,
}) => {
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
            <div className="mb-6">
              <div className="flex justify-around items-center">
                <button
                  onClick={toggleHold}
                  disabled={!session}
                  className={`p-4 rounded-full ${isHeld ? 'bg-blue-dark text-white' : 'text-gray-600'}`}
                >
                  <BsPause className="text-3xl" />
                </button>
                <button disabled className="p-4 rounded-full text-gray-600">
                  <BsCameraVideo className="text-3xl" />
                </button>

                <button className="p-4 text-gray-600 rounded-full" onClick={() => setShowKeyPad(true)}>
                  <IoIosKeypad className="text-3xl" />
                </button>
              </div>
              <div className="flex justify-around items-center">
                {(conferenceStatus && (
                  <button className="p-4 rounded-full text-gray-600" disabled={!session} onClick={reqUnHold}>
                    <MdCallMerge className="text-3xl" />
                  </button>
                )) || (
                  <button
                    className="p-4 rounded-full text-gray-600"
                    disabled={!session}
                    onClick={() => setCallConference(true)}
                  >
                    <BsPersonPlus className="text-3xl" />
                  </button>
                )}

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!session}
                    className={`flex items-center space-x-2 px-4 py-2 text-gray-600 rounded-lg transition-opacity focus:outline-none ${
                      !session ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaStopCircle className="text-3xl text-green-500" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 rounded-lg transition-opacity focus:outline-none"
                  >
                    <FaStopCircle className="text-3xl text-red-500" />
                    <span className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                )}
                <button
                  className={`p-4 rounded-full ${muted ? 'bg-blue-dark text-white' : 'text-gray-600'}`}
                  onClick={() => {
                    muted ? session.unmute() : session.mute();
                    setMuted(!muted);
                  }}
                >
                  <BsMicMute className="text-3xl" />
                </button>
              </div>
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
            stopRecording();
          }}
        >
          <ImPhoneHangUp size={20} />
        </button>

        <div className="mt-5">
          <select
            id="audio-device"
            value={selectedDeviceId}
            onChange={(e) => changeAudioDevice(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Audio device ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;
