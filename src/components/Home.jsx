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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-72 p-4 bg-white rounded-lg shadow-none md:shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-blue-dark">WebPhone</div>
          <div
            className="cursor-pointer text-blue-dark"
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
            className="w-full outline-none text-2xl indent-1.5"
          />
          {phoneNumber && (
            <div
              className="absolute inset-y-0 right-0 flex items-center cursor-pointer text-blue-dark"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setPhoneNumber((prev) => prev.slice(0, -1).trim())}
            >
              {isHovered ? <TiBackspace size={24} /> : <TiBackspaceOutline size={24} />}
            </div>
          )}
        </div>

        <KeyPad setPhoneNumber={setPhoneNumber} />
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

export default Home;
