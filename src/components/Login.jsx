import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import HistoryContext from '../context/HistoryContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from '../utils/apiUtils';

function Login() {
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { username, setUsername, password, setPassword } = useContext(HistoryContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formValidation = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = 'Please enter username';
    }
    if (!values.password) {
      errors.password = 'Please enter password';
    } else if (values.password.length < 6) {
      errors.password = 'Password length should be at least 6 characters';
    }

    return errors;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      const errors = formValidation({ username, password });
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        return;
      }

      try {
        const data = await login(username, password);

        if (data.message === 'wrong login info') {
          toast.error('Incorrect username or password');
          navigate('/login');
          return;
        }

        localStorage.setItem('token', JSON.stringify(data));
        toast.success('Login successfully');
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
        toast.error('Login failed. Please try again.');
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
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:block">
              <img src="/images/calling.svg" alt="Login Image" className="object-cover w-full h-full" />
            </div>
            <div className="p-8 space-y-8">
              <h2 className="text-3xl font-semibold text-center text-blue-dark">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
                  <input
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue"
                  />
                  {validationErrors.username && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.username}</p>
                  )}
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
                      {showPassword ? <FaEye/> : <FaEyeSlash />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue hover:bg-blue-dark text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
                >
                  Login
                </button>
              </form>
              {error && <p className="mt-2 text-center text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
