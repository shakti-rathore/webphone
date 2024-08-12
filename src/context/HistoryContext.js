import { createContext, useEffect, useState } from "react";

// Define a type for the context value (if using TypeScript)
const HistoryContext = createContext({
  history: [],
  setHistory: () => {},
  username: '',
  setUsername: () => {},
  password: '',
  setPassword: () => {},
});

export const HistoryProvider = ({ children }) => {
  // Retrieve call history from localStorage or initialize as empty array
  const callHistory = localStorage.getItem("call-history");
  const initialHistory = callHistory ? JSON.parse(callHistory) : [];
  const [history, setHistory] = useState(initialHistory);
  const [username, setUsername] = useState('demo@surya');
  const [password, setPassword] = useState('Demo@123');

  // Update localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem("call-history", JSON.stringify(history));
  }, [history]);

  // Provide context values to children components
  return (
    <HistoryContext.Provider value={{ history, setHistory, username, setUsername, password, setPassword }}>
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryContext;
