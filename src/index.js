import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HistoryProvider } from './context/HistoryContext';
import App from './App';
import Login from './components/Login';
import Layout from './components/layouts/Layout';
import './index.css';
import SubscriptionExpired from './components/SubscriptionExpired';

const AppRoutes = () => {
  const CommonLayout = ({ children }) => (
    <div className="bg-[#ecf3f9] antialiased scroll-smooth dark:bg-[#121212]">
      <Layout>{children}</Layout>
    </div>
  );

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/webphone/login"
          element={
            <HistoryProvider>
              <Login />
            </HistoryProvider>
          }
        />
        <Route
          path="/webphone/subscription-expired"
          element={
            <HistoryProvider>
              <SubscriptionExpired />
            </HistoryProvider>
          }
        />
        <Route
          path="/webphone/dashboard"
          element={
            <HistoryProvider>
              <CommonLayout>
                <App />
              </CommonLayout>
            </HistoryProvider>
          }
        />

        <Route path="*" element={<Navigate to="/webphone/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

ReactDOM.render(<AppRoutes />, document.getElementById('root'));
