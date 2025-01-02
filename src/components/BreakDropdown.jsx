import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import HistoryContext from '../context/HistoryContext';

const BreakDropdown = ({ breakDropdown }) => {
  const { username, selectedBreak, setSelectedBreak } = useContext(HistoryContext);
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

  const removeBreak = async () => {
    if (breakDropdown) {
      // If breakDropdown is true, just update the state without API call
      setSelectedBreak('Break');
      setIsOpen(false);
      return;
    }

    try {
      const response = await axios.post(`https://callapp.iotcom.io/user/removebreakuser:${username}`);
      if (response.status === 200) {
        setSelectedBreak('Break');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error removing break:', error);
    }
  };

  const sendBreakSelection = async (breakType) => {
    if (selectedBreak !== 'Break') {
      await removeBreak();
      return;
    }

    if (breakDropdown) {
      setSelectedBreak(breakType);
      setIsOpen(false);
      return;
    }

    try {
      const response = await axios.post(`https://callapp.iotcom.io/user/breakuser:${username}`, {
        breakType,
      });

      if (response.status === 200) {
        setSelectedBreak(breakType);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error selecting break:', error);
    }
  };

  const handleButtonClick = () => {
    if (selectedBreak === 'Break') {
      setIsOpen(!isOpen);
    } else {
      removeBreak();
    }
  };

  const breakTypes = [
    { type: 'TeaBreak', label: 'Tea Break', color: 'green-500' },
    { type: 'LunchBreak', label: 'Lunch Break', color: 'green-500' },
    { type: 'TrainingBreak', label: 'Training Break', color: 'green-500' },
  ];

  const buttonClassName =
    selectedBreak === 'Break'
      ? 'primary-btn'
      : `px-4 py-2 text-white bg-${
          breakTypes.find((b) => b.type === selectedBreak)?.color
        } rounded-md focus:outline-none`;

  return (
    <div className="relative inline-block text-left">
      <button onClick={handleButtonClick} className={buttonClassName}>
        {selectedBreak === 'Break' ? 'Break' : `${selectedBreak.replace('Break', '')} Break`}
      </button>

      {isOpen && selectedBreak === 'Break' && (
        <ul
          ref={dropdownRef}
          className="absolute z-10 mt-2 w-48 bg-white border dark:bg-black/50 dark:text-white dark:border-[#999] border-gray-200 rounded-md shadow-lg"
        >
          {breakTypes.map(({ type, label, color }) => (
            <li
              key={type}
              onClick={() => sendBreakSelection(type)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-600 flex justify-between items-center group"
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BreakDropdown;