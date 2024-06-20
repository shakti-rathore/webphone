import { useState } from 'react';
import { FiPhone } from 'react-icons/fi';
import { VscHistory } from 'react-icons/vsc';
import { TiBackspaceOutline, TiBackspace } from 'react-icons/ti';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';
import KeyPad from './KeyPad';

const Home = ({ phoneNumber, setPhoneNumber, handleCall, setSeeLogs }) => {
  const [isHovered, setIsHovered] = useState(false);
  const formatPhoneNumber = useFormatPhoneNumber();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-50">
      <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-teal-dark">WebPhone</div>
          <div
            className="cursor-pointer text-teal-dark"
            onClick={() => {
              setSeeLogs(true);
            }}
          >
            <VscHistory size={24} />
          </div>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            value={formatPhoneNumber(phoneNumber)}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
            }}
            placeholder="Phone number"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
          />
          {phoneNumber && (
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-teal-dark"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setPhoneNumber((prev) => prev.slice(0, -1).trim())}
            >
              {isHovered ? <TiBackspace size={24} /> : <TiBackspaceOutline size={24} />}
            </div>
          )}
        </div>

        <KeyPad setPhoneNumber={setPhoneNumber} />

        <button
          className="flex items-center justify-center w-full py-2 mt-4 bg-teal text-white rounded-md hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-teal focus:ring-opacity-50"
          onClick={handleCall}
        >
          <FiPhone className="mr-2" size={20} />
          Call
        </button>
      </div>
    </div>
  );
};

export default Home;
