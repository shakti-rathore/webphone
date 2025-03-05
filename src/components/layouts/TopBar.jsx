import { useEffect, useState, useMemo, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { RiMoonLine, RiSunLine } from 'react-icons/ri';
import BreakDropdown from '../BreakDropdown';
import HistoryContext from '../../context/HistoryContext';
import { FiLogOut } from 'react-icons/fi';
import { FaPhoneSlash, FaPhoneSquareAlt } from 'react-icons/fa';
import DynamicForm from '../DynamicForm';

const TopBar = () => {
  const toggleTheme = useTheme();
  const location = useLocation();
  const { setDropCalls, selectedStatus, setInfo } = useContext(HistoryContext);
  const [campaign, setCampaign] = useState(false);
  const tokenData = localStorage.getItem('token');
  const parsedData = JSON.parse(tokenData);
  const username = parsedData?.userData?.userid;

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/webphone/login';
  }

  return (
    <>
      {/* {campaign && <DynamicForm campaign={campaign} onClose={() => setCampaign(false)} />} */}

      <header className="bg-white h-16 flex items-center p-4 justify-between dark:bg-[#1a1a1a] border-b dark:border-[#333] border-[#ddd] sticky top-0 z-50">
        <div className="flex gap-x-12 items-center">
          <Link to="/webphone/dashboard">
            <img src={`${window.location.origin}/webphone/images/logo.png`} alt="Logo" width={48} height={48} />
          </Link>
        </div>

        <div className="flex items-center gap-x-3 flex-wrap md:flex-nowrap">
          <div className="items-center gap-x-2 px-3 py-2 rounded-md bg-gray-100 sm:flex hidden dark:bg-[#918c8c38]">
            <span className="font-semibold text-primary dark:text-[#00498e] text-sm md:text-base">
              {username || 'Guest'}
            </span>
          </div>
          {(location.pathname != '/webphone/agent-dashboard' && (
            <>
              <Link
                to="/webphone/agent-dashboard"
                className={`primary-btn text-sm md:text-base hover:no-underline hover:outline-0 focus:outline-0 focus:no-underline ${
                  selectedStatus !== 'start' ? 'pointer-events-none' : ''
                }`}
              >
                Agent
              </Link>

              <BreakDropdown dispoWithBreak={false} selectedStatus={selectedStatus} />
              <div className="relative">
                <button
                  onClick={() => setInfo(true)}
                  className="hidden md:block primary-btn text-sm md:text-base whitespace-nowrap"
                  // disabled={selectedStatus !== 'start'}
                >
                  Info Calls
                </button>
                <button onClick={() => setInfo(true)} className="block md:hidden text-sm md:text-base">
                  <FaPhoneSquareAlt className="text-primary dark:text-[#00498e]" />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setDropCalls(true)}
                  className="hidden md:block primary-btn text-sm md:text-base whitespace-nowrap"
                  disabled={selectedStatus !== 'start'}
                >
                  Drop Calls
                </button>
                <button onClick={() => setDropCalls(true)} className="block md:hidden text-sm md:text-base">
                  <FaPhoneSlash className="text-primary dark:text-[#00498e]" />
                </button>
              </div>
            </>
          )) || (
            <ul className="flex gap-x-3 mb-0">
              <Link
                to={'/webphone/dashboard'}
                className={`text-sm md:text-base ${
                  location.pathname === '/webphone/dashboard' ? 'primary-btn-outline' : 'primary-btn'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to={'/webphone/agent-dashboard'}
                className={`text-sm md:text-base ${
                  location.pathname === '/webphone/agent-dashboard' ? 'primary-btn-outline' : 'primary-btn'
                }`}
              >
                Agent
              </Link>
            </ul>
          )}

          <button
            className="primary-btn md:block hidden text-sm md:text-base"
            disabled={selectedStatus !== 'start'}
            onClick={handleLogout}
          >
            Logout
          </button>
          <button className="block md:hidden text-sm" disabled={selectedStatus !== 'start'} onClick={handleLogout}>
            <FiLogOut />
          </button>

          <DarkModeToggle toggleTheme={toggleTheme} />
        </div>
      </header>
    </>
  );
};

const DarkModeToggle = ({ toggleTheme }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme');
    setIsDarkMode(currentTheme === 'dark');
  }, []);

  const handleToggle = () => {
    toggleTheme();
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <label htmlFor="dark-toggle" className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" id="dark-toggle" className="hidden" checked={isDarkMode} onChange={handleToggle} />
        <DarkModeSlider isDarkMode={isDarkMode} />
      </div>
      <DarkModeLabel isDarkMode={isDarkMode} />
    </label>
  );
};

const DarkModeSlider = ({ isDarkMode }) => (
  <div className="block w-14 h-8 rounded-full border-[1px] border-yellow-300 dark:border-[#00498e] bg-yellow-100 dark:bg-[#1a1a1a]">
    <div
      className={`absolute left-1 top-1 w-6 h-6 flex items-center justify-center rounded-full transition-transform duration-500 transform ${
        isDarkMode ? 'translate-x-6' : ''
      } bg-yellow-400 dark:bg-[#00498e]`}
    >
      {isDarkMode ? (
        <RiMoonLine className="text-white" width={16} height={16} />
      ) : (
        <RiSunLine className="text-white" width={16} height={16} />
      )}
    </div>
  </div>
);

const DarkModeLabel = ({ isDarkMode }) => (
  <div className="ml-3 font-medium text-gray-900 dark:text-[#00498e] md:block hidden">
    {isDarkMode ? 'Dark' : 'Light'}
  </div>
);

export default TopBar;
