const keyboard = [
  { num: 1, text: '' },
  { num: 2, text: 'abc' },
  { num: 3, text: 'def' },
  { num: 4, text: 'ghi' },
  { num: 5, text: 'jkl' },
  { num: 6, text: 'mno' },
  { num: 7, text: 'pqrs' },
  { num: 8, text: 'tuv' },
  { num: 9, text: 'wxyz' },
  { num: '*', text: '' },
  { num: 0, text: '+' },
  { num: '#', text: '' },
];

const KeyPad = ({ setPhoneNumber }) => {
  return (
    <div className="flex justify-center items-center mt-3">
      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
        {keyboard.map((item) => (
          <button
            key={item.num}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-full border bg-[#EAEAEA] shadow-sm hover:bg-blue-light focus:outline-none transition-colors duration-200"
            onClick={() => setPhoneNumber((prev) => prev + String(item.num))}
          >
            <span className="text-3xl font-semibold text-[#070707]">{item.num}</span>
            <span className="text-xs text-gray-600 uppercase">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KeyPad;
