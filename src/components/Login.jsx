import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import HistoryContext from '../context/HistoryContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [validationErrors, setValidationErrors] = useState({});
  const { username, setUsername, password, setPassword } = useContext(HistoryContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const checkMicrophoneAccess = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some((device) => device.kind === 'audioinput');
      if (!hasAudioInput) {
        toast.error('Please connect a microphone to continue');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      toast.error('Please connect a microphone to continue');
      return false;
    }
  };

  const formValidation = (values) => {
    const errors = {};
    if (!values.username) errors.username = 'Please enter username';
    if (!values.password) errors.password = 'Please enter password';
    else if (values.password.length < 6) errors.password = 'Password length should be at least 6 characters';
    return errors;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = formValidation({ username, password });
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const hasMicrophone = await checkMicrophoneAccess();
      if (!hasMicrophone) return;

      try {
        const headers = { 'Content-Type': 'application/json' };
        const response = await fetch(`${window.location.origin}/userlogin/${username}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong!');
        }

        if (data.message === 'wrong login info') {
          toast.error('Incorrect username or password');
          return;
        }

        if (data.message === 'User already login somewhere else') {
          toast.error(data.message || 'User already logged in elsewhere. Please log out from other devices.');
          return;
        }

        const expiryDate = new Date(data.userData.ExpiryDate);
        const currentDate = new Date();
        const differenceInTime = expiryDate - currentDate;
        const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

        if (differenceInDays < 3 && differenceInDays > 0) {
          toast.error('Your subscription is about to expire. Please renew soon!');
        } else if (differenceInDays < 0) {
          const daysExpired = Math.abs(differenceInDays);
          if (daysExpired <= 1) {
            toast.error('Subscription expired yesterday');
            await delay(10000);
          } else if (daysExpired <= 3) {
            toast.error('Subscription expired over 2 days ago');
            await delay(20000);
          } else if (daysExpired <= 4) {
            toast.error('Subscription expired over 3 days ago');
            await delay(30000);
          } else if (daysExpired <= 5) {
            toast.error('Subscription expired over 4 days ago');
            await delay(60000);
          } else {
            toast.error('Subscription expired more than 5 days ago. Please renew to continue.');
            return;
          }
        }

        localStorage.setItem('token', JSON.stringify(data));
        toast.success('Login successfully');
        navigate('/webphone/dashboard');
      } catch (err) {
        toast.error(err.message || 'Login failed. Please try again.');
      }
    },
    [username, password, navigate]
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-xs sm:max-w-xl lg:max-w-4xl bg-white rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:block">
              <img src="/images/calling.svg" alt="Login Image" className="object-cover w-full h-full" />
            </div>
            <div className="p-8 space-y-8">
              <h2 className="text-3xl font-semibold text-center text-primary">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
                  <input
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue"
                  />
                  {validationErrors.username && <p className="error-msg">{validationErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  {validationErrors.password && <p className="error-msg">{validationErrors.password}</p>}
                </div>
                <button type="submit" className="primary-btn w-full">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default Login;
