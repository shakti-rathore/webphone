import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import HistoryContext from '../context/HistoryContext';

const BreakDropdown = () => {
  const { username } = useContext(HistoryContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const sendBreakSelection = async (breakType) => {
    try {
      const response = await axios.post(`https://callapp.iotcom.io/user/breakuser:${username}`, {
        breakType,
      });

      if (response.status === 200) {
        toast.success(`${breakType} selected successfully!`);
      }
    } catch (error) {
      toast.error('Something went wrong! Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleDropdown}
        className="px-4 py-2 text-white bg-blue rounded-md shadow-md hover:bg-blue-dark focus:outline-none"
      >
        Break
      </button>

      {isOpen && (
        <ul ref={dropdownRef} className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
          <li
            onClick={() => {
              setIsOpen(false);
              sendBreakSelection('TeaBreak');
            }}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center group"
          >
            Tea Break
            <span className="group-hover:bg-blue-600 w-2 h-2 rounded-full bg-gray-300 transition"></span>
          </li>
          <li
            onClick={() => {
              setIsOpen(false);
              sendBreakSelection('LunchBreak');
            }}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center group"
          >
            Lunch Break
            <span className="group-hover:bg-green-600 w-2 h-2 rounded-full bg-gray-300 transition"></span>
          </li>
          <li
            onClick={() => {
              setIsOpen(false);
              sendBreakSelection('TrainingBreak');
            }}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center group"
          >
            Training Break
            <span className="group-hover:bg-red-600 w-2 h-2 rounded-full bg-gray-300 transition"></span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default BreakDropdown;
