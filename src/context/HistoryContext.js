import { createContext, useEffect, useState } from 'react';

const HistoryContext = createContext({
  history: [],
  setHistory: () => {},
  username: '',
  setUsername: () => {},
  password: '',
  setPassword: () => {},
});

export const HistoryProvider = ({ children }) => {
  const callHistory = localStorage.getItem('call-history');
  const initialHistory = callHistory ? JSON.parse(callHistory) : [];
  const [history, setHistory] = useState(initialHistory);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBreak, setSelectedBreak] = useState('Break');

  useEffect(() => {
    localStorage.setItem('call-history', JSON.stringify(history));
  }, [history]);

  return (
    <HistoryContext.Provider
      value={{ history, setHistory, username, setUsername, password, setPassword, selectedBreak, setSelectedBreak }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryContext;
