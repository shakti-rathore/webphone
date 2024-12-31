import React from 'react';
import moment from 'moment';
import { BiPhoneOff } from 'react-icons/bi';

const CallerInfo = ({ usermissedCalls }) => {
  if (!usermissedCalls.length) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <p className="text-center text-gray-500 dark:text-gray-400">No missed calls</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <div className="space-y-4">
          {usermissedCalls.map((call, index) => (
            <div key={index} className={`${index !== 0 ? 'border-t border-gray-200 dark:border-gray-700 pt-4' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <BiPhoneOff className="h-6 w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{call.Caller}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {moment(parseInt(call.startTime)).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Missed
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallerInfo;
