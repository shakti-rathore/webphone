import { createContext, useEffect, useState } from 'react';

const HistoryContext = createContext({
  history: [],
  setHistory: () => {},
  username: 'demo@surya',
  password: 'Demo@123',
  selectedBreak: 'Break',
  setSelectedBreak: () => {},
  dropCalls: false,
  setDropCalls: () => {},
  info: false,
  setInfo: () => {},
  selectedStatus: '',
  setSelectedStatus: () => {},
});

export const HistoryProvider = ({ children }) => {
  const callHistory = localStorage.getItem('call-history');
  const initialHistory = callHistory ? JSON.parse(callHistory) : [];
  const [history, setHistory] = useState(initialHistory);
  const [selectedBreak, setSelectedBreak] = useState('Break');
  const [dropCalls, setDropCalls] = useState(false);
  const [info, setInfo] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    localStorage.setItem('call-history', JSON.stringify(history));
  }, [history]);

  return (
    <HistoryContext.Provider
      value={{
        history,
        setHistory,
        username: 'demo@surya',   // static
        password: 'Demo@123',     // static
        selectedBreak,
        setSelectedBreak,
        dropCalls,
        setDropCalls,
        info,
        setInfo,
        selectedStatus,
        setSelectedStatus,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryContext;
