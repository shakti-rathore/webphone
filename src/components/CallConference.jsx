import { useState } from 'react';
import { FiPhone } from 'react-icons/fi';
import { TiBackspaceOutline, TiBackspace } from 'react-icons/ti';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';
import KeyPad from './KeyPad';

const CallConference = ({ conferenceNumber, handleCall, setCallConference, phoneNumber, setConferenceNumber }) => {
  const [isHovered, setIsHovered] = useState(false);
  const formatPhoneNumber = useFormatPhoneNumber();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-72 p-4 bg-white rounded-lg shadow-none md:shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)]">
        <div className="text-xl font-bold text-blue-dark mb-2">WebPhone</div>
        <marquee
          className="text-sm text-white p-1 cursor-pointer bg-blue-dark mb-4"
          onClick={() => setCallConference(false)}
        >
          Return on {phoneNumber}
        </marquee>
        <div className="relative mb-4">
          <input
            type="text"
            value={formatPhoneNumber(conferenceNumber)}
            onChange={(e) => {
              setConferenceNumber(e.target.value);
            }}
            placeholder="Phone number"
            className="w-full outline-none text-2xl indent-1.5"
          />
          {phoneNumber && (
            <div
              className="absolute inset-y-0 right-0 flex items-center cursor-pointer text-blue-dark"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setConferenceNumber((prev) => prev.slice(0, -1).trim())}
            >
              {isHovered ? <TiBackspace size={24} /> : <TiBackspaceOutline size={24} />}
            </div>
          )}
        </div>

        <KeyPad setConferenceNumber={setConferenceNumber} />
        <div className="text-center">
          <button
            className="p-4 mt-4 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:bg-green-500"
            onClick={handleCall}
          >
            <FiPhone size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallConference;
