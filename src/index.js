import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { HistoryProvider } from './context/HistoryContext';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

ReactDOM.render(
  <Router>
    <Routes>
      <Route
        path="/login"
        element={
          <React.StrictMode>
            <HistoryProvider>
              <Login />
            </HistoryProvider>
          </React.StrictMode>
        }
      />
      <Route
        path="/dashboard"
        element={
          <React.StrictMode>
            <HistoryProvider>
              <Toaster position="top-right" reverseOrder={false} />
              <App />
            </HistoryProvider>
          </React.StrictMode>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
