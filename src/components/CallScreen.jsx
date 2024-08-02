import { BsPersonFill, BsMicMute } from 'react-icons/bs';
import { IoIosKeypad } from 'react-icons/io';
import { IoCloseCircleOutline, IoCloseCircle } from 'react-icons/io5';
import { ImPhoneHangUp } from 'react-icons/im';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';
import { useState } from 'react';
import KeyPad from './KeyPad';

const CallScreen = ({
  phoneNumber,
  session,
  seconds,
  minutes,
  isRunning,
  devices,
  selectedDeviceId,
  changeAudioDevice,
}) => {
  const [currNum, setCurrNum] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showKeyPad, setShowKeyPad] = useState(false);
  const [muted, setMuted] = useState(false);
  const debugDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('All devices:', devices);
      console.log(
        'Audio input devices:',
        devices.filter((device) => device.kind === 'audioinput')
      );
    } catch (error) {
      console.error('Debug error:', error);
    }
  };
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
        <div className="w-full mt-4">
          <label htmlFor="audio-device" className="block text-sm font-medium text-gray-700 mb-1">
            Audio Device:
          </label>
          <select
            id="audio-device"
            value={selectedDeviceId}
            onChange={(e) => changeAudioDevice(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
