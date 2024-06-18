import { createContext, useEffect, useState } from "react";

const HistoryContext = createContext({});
export const HistoryProvider = ({ children }) => {
  const callHistory = localStorage.getItem("call-history");
  const lst = (callHistory && JSON.parse(callHistory)) || [];
  const [history, setHistory] = useState(lst);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    localStorage.setItem("call-history", JSON.stringify(history));
  }, [history]);

  return (
    <HistoryContext.Provider value={{ history, setHistory,username,setUsername,password,setPassword }}>
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryContext;
