import HistoryContext from '../context/HistoryContext';
import { useContext } from 'react';
import HistoryItem from './HistoryItem';
import { IoMdArrowBack } from 'react-icons/io';
import { BsTrash } from 'react-icons/bs';

const HistoryScreen = ({ setSeeLogs }) => {
  const { history, setHistory } = useContext(HistoryContext);

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50 p-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center mb-4 gap-x-1">
          <div
            className="cursor-pointer text-teal-dark"
            onClick={() => {
              setSeeLogs(false);
            }}
          >
            <IoMdArrowBack className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-teal-dark">Call logs</h3>

          <div
            className="cursor-pointer text-teal-dark ml-auto hover:text-red-700 transition-all"
            onClick={() => {
              setHistory([]);
            }}
          >
            <BsTrash className="text-xl" />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[60vh] p-3">
          {history.length === 0 ? (
            <p className="text-gray-600">No recent calls</p>
          ) : (
            [...history]
              .reverse()
              .map((item, index) => (
                <HistoryItem
                  key={index}
                  date={item.startTime}
                  phone={item.phoneNumber}
                  start={item.start}
                  end={item.end}
                  status={item.status}
                  index={index}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;
