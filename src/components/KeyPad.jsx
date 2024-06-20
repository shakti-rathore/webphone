import React from 'react';

const keyboard = [
  { num: 1, text: '' },
  { num: 2, text: 'ABC' },
  { num: 3, text: 'DEF' },
  { num: 4, text: 'GHI' },
  { num: 5, text: 'JKL' },
  { num: 6, text: 'MNO' },
  { num: 7, text: 'PQRS' },
  { num: 8, text: 'TUV' },
  { num: 9, text: 'WXYZ' },
  { num: '*', text: '' },
  { num: 0, text: '+' },
  { num: '#', text: '' },
];

const KeyPad = ({ setPhoneNumber }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {keyboard.map((item) => (
        <button
          key={item.num}
          className="flex flex-col items-center justify-center w-20 h-20 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 focus:outline-none transition-colors duration-200"
          onClick={() => setPhoneNumber((prev) => prev + String(item.num))}
        >
          <span className="text-3xl font-semibold text-gray-800">{item.num}</span>
          <span className="text-xs text-gray-600 mt-1">{item.text}</span>
        </button>
      ))}
    </div>
  );
};

export default KeyPad;