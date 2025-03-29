import { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import {
  FaSignOutAlt,
  FaUser,
  FaIdBadge,
  FaRocket,
  FaPalette,
  FaUserTie,
  FaPhoneSlash,
  FaChevronDown,
  FaTachometerAlt,
} from 'react-icons/fa';
import BreakDropdown from '../BreakDropdown';
import HistoryContext from '../../context/HistoryContext';

const TopBar = () => {
  const toggleTheme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDropCalls, selectedStatus } = useContext(HistoryContext);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const tokenData = localStorage.getItem('token');
  const parsedData = JSON.parse(tokenData);
  const username = parsedData?.userData?.username || 'Guest';
  const userId = parsedData?.userData?.userid || 'N/A';
  const campaignName = parsedData?.userData?.campaign || 'N/A';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/webphone/login';
  };

  const getInitials = (name = '') => {
    const words = name.trim().split(' ');
    return words
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.user-dropdown')) {
      setShowUserDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    setShowUserDropdown(false); // Close dropdown on route change
  }, [location.pathname]);

  const handleThemeToggle = () => {
    toggleTheme();
    setShowUserDropdown(false);
  };

  return (
    <header className="bg-white h-16 flex items-center p-4 justify-between dark:bg-[#1a1a1a] border-b dark:border-[#333] border-[#ddd] sticky top-0 z-50">
      <Link to="/webphone/dashboard">
        <img src="${window.location.origin}/webphone/images/logo.png" alt="Logo" width={48} height={48} />
      </Link>

      <div className="flex items-center gap-x-3 flex-wrap md:flex-nowrap">
        {location.pathname === '/webphone/dashboard' && (
          <>
            <BreakDropdown dispoWithBreak={false} selectedStatus={selectedStatus} />
            <button
              onClick={() => setDropCalls(true)}
              className="primary-btn text-sm md:text-base whitespace-nowrap"
              disabled={selectedStatus !== 'start'}
            >
              <FaPhoneSlash className="inline-block mr-1" />
              Drop Calls
            </button>
          </>
        )}

        {/* User Dropdown */}
        <div className="relative user-dropdown">
          <button
            onClick={() => setShowUserDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#00498e] rounded-md text-sm font-semibold text-primary dark:text-white"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 dark:bg-white text-primary font-bold">
              {getInitials(username)}
            </span>
            <FaChevronDown className="text-xs" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1a1a] shadow-xl rounded-lg border dark:border-[#333] z-50">
              <div className="px-4 py-3 border-b dark:border-[#333]">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                  <FaUserTie />
                  {username}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <FaIdBadge />
                  {userId}
                </div>
              </div>

              <ul className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                <li className="flex items-center gap-2 px-4 py-2">
                  <FaRocket className="text-blue-500" />
                  Campaign: <span className="font-semibold">{campaignName}</span>
                </li>

                <li
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]"
                  onClick={handleThemeToggle}
                >
                  <FaPalette className="text-yellow-500" />
                  Toggle Theme
                </li>

                <li className="hover:bg-gray-100 dark:hover:bg-[#333]">
                  <Link to="/webphone/dashboard" className="flex items-center gap-2 px-4 py-2 w-full">
                    <FaTachometerAlt className="text-purple-500" />
                    Dashboard
                  </Link>
                </li>

                <li className="hover:bg-gray-100 dark:hover:bg-[#333]">
                  <Link to="/webphone/agent-dashboard" className="flex items-center gap-2 px-4 py-2 w-full">
                    <FaUser className="text-green-600" />
                    Agent Dashboard
                  </Link>
                </li>

                <li
                  className="flex items-center gap-2 px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
