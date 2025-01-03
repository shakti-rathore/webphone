import React, { useState, useEffect } from 'react';

const NetworkMonitor = ({ requestTime }) => {
  const getSignalStrength = () => {
    if (!requestTime) return 0;
    if (requestTime > 2500) return 1;
    if (requestTime > 1500) return 2;
    if (requestTime > 500) return 3;
    return 4;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end h-4 gap-1">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`w-1 rounded-sm transition-all duration-300 ${
              index < getSignalStrength() ? 'bg-green-500' : 'bg-gray-300'
            }`}
            style={{ height: `${(index + 1) * 25}%` }}
          />
        ))}
      </div>
      {/* <div className="text-xs text-gray-600">
        {requestTime ? `${Math.round(requestTime)}ms` : 'No connection'}
      </div> */}
    </div>
  );
};

export default NetworkMonitor;
