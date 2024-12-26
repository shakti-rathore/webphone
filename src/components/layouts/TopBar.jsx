import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { RiMoonLine, RiSunLine } from 'react-icons/ri';
import BreakDropdown from '../BreakDropdown';

const TopBar = () => {
  const toggleTheme = useTheme();
  const location = useLocation();

  const navLinks = useMemo(
    () => [
      // { path: '/webphone/dashboard', label: 'Dashboard' },
      // { path: '/webphone/campaign', label: 'Campaign' },
      // { path: '/webphone/campaign-details', label: 'Campaign' },
    ],
    []
  );

  return (
    <header className="bg-white h-16 flex items-center p-4 justify-between dark:bg-[#1a1a1a] border-b dark:border-[#333] border-[#ddd] sticky top-0 z-50">
      <div className="flex gap-x-12 items-center">
        <Link to="/webphone/dashboard">
          <img src="/images/logo.png" alt="Logo" width={48} height={48} />
        </Link>
      </div>

      <ul className="flex gap-x-6">
        {navLinks.map(({ path, label }) => (
          <NavLink key={path} path={path} label={label} />
        ))}
      </ul>

      <div className="flex items-center md:gap-x-6 gap-x-3">
        <BreakDropdown />
        <DarkModeToggle toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};

const NavLink = ({ path, label }) => (
  <li
    className={`hover:text-primary transition-colors dark:hover:text-[#00498e] ${
      location.pathname === path ? 'text-primary dark:text-[#00498e]' : 'text-black dark:text-white'
    }`}
  >
    <Link to={path}>{label}</Link>
  </li>
);

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
