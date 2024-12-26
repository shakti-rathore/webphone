import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HistoryProvider } from './context/HistoryContext';
import App from './App';
import Campaign from './components/Campaign';
import Login from './components/Login';
import Layout from './components/layouts/Layout';
import CampaignDetails from './components/CampaignDetails';
import './index.css';
import AutoDial from './components/AutoDial';

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
          path="/webphone/dashboard"
          element={
            <HistoryProvider>
              <CommonLayout>
                <App />
              </CommonLayout>
            </HistoryProvider>
          }
        />
        {/* <Route
          path="/webphone/campaign"
          element={
            <HistoryProvider>
              <CommonLayout>
                <Campaign />
              </CommonLayout>
            </HistoryProvider>
          }
        /> */}
        {/* <Route
          path="/webphone/campaign-details"
        element={
            <HistoryProvider>
              <CommonLayout>
                <CampaignDetails />
              </CommonLayout>
            </HistoryProvider>
          }
        /> */}
        <Route path="*" element={<Navigate to="/webphone/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
  document.getElementById('root')
);
