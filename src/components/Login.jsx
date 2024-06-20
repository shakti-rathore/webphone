import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryContext from '../context/HistoryContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from '../utils/apiUtils';

function Login() {
  const [error, setError] = useState(null);
  const { username, setUsername, password, setPassword } = useContext(HistoryContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      try {
        const data = await login(username, password);

        if (data.message === 'wrong login info') {
          navigate('/login');
          return;
        }

        localStorage.setItem('token', JSON.stringify(data));
        navigate('/dashboard');
      } catch (err) {
        console.error('Login error:', err);
        setError(err.message);
      }
    },
    [username, password, navigate]
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-teal-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-center text-teal-dark">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-teal hover:bg-teal-dark text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            Login
          </button>
        </form>
        {error && <p className="mt-2 text-center text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
