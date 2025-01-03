import React, { useCallback, useMemo } from 'react';
import { FiPhone } from 'react-icons/fi';
import useFormatPhoneNumber from '../hooks/useFormatPhoneNumber';

const CallerInfo = ({ usermissedCalls, setDropCalls, setPhoneNumber, handleCall }) => {
  const formatPhoneNumber = useFormatPhoneNumber();

  const groupedCalls = useMemo(() => {
    return Object.values(usermissedCalls || {}).reduce((acc, call) => {
      if (!call?.Caller) return acc;

      if (!acc[call.Caller]) {
        acc[call.Caller] = {
          count: 0,
          calls: [],
          latestTime: 0,
        };
      }

      acc[call.Caller].count += 1;
      acc[call.Caller].calls.push(call);
      acc[call.Caller].latestTime = Math.max(acc[call.Caller].latestTime, parseInt(call.startTime) || 0);

      return acc;
    }, {});
  }, [usermissedCalls]);

  const removeCountryCode = (phoneNumber, countryCode = '+91') => {
    return phoneNumber.startsWith(countryCode) ? phoneNumber.slice(countryCode.length) : phoneNumber;
  };

  const initiateCall = useCallback(
    (caller) => {
      const sanitizedCaller = removeCountryCode(caller);
      setPhoneNumber(formatPhoneNumber(sanitizedCaller));
      handleCall();
      setDropCalls(false);
    },
    [setPhoneNumber, formatPhoneNumber]
  );

  if (Object.entries(groupedCalls).length === 0) {
    return (
      <div className="p-3">
        <p className="text-gray-500">No missed calls available.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {Object.entries(groupedCalls).map(([caller, data]) => (
        <div
          key={caller}
          className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:mb-0"
        >
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {caller}
              <span className="text-sm font-normal text-gray-600">
                ({data.count} missed {data.count === 1 ? 'call' : 'calls'})
              </span>
            </h3>
            <p className="text-sm text-gray-500">Recent call: {new Date(data.latestTime).toLocaleString()}</p>
          </div>
          <button
            onClick={() => initiateCall(caller)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors duration-200"
            aria-label={`Call ${caller}`}
          >
            <FiPhone className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CallerInfo;
