import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered, faExpand, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/hooks/useTheme';
import Image from 'next/image';
import Link from 'next/link';

const TopBarPage = ({ handleSidebarToggle }) => {
  const toggleTheme = useTheme();

  return (
    <>
      <header className="bg-white h-16 flex items-center p-4 justify-between dark:bg-[#1a1a1a] border-b dark:border-[#333] border-[#ddd] sticky top-0 z-50">
        <div className="flex gap-x-12 items-center">
          <Logo />
          <FontAwesomeIcon
            icon={faBarsStaggered}
            width={30}
            height={30}
            className="cursor-pointer text-xl dark:text-white text-gray-600 hover:text-primary transition-all"
            onClick={handleSidebarToggle}
          />
        </div>
        <div className="flex items-center md:gap-x-6 gap-x-3">
          <FullScreenToggle />
          <DarkModeToggle toggleTheme={toggleTheme} />
        </div>
      </header>
    </>
  );
};

const Logo = () => (
  <Link href={'/dashboard'}>
    <Image src="/img/logo.svg" alt="Logo" width={48} height={48} />
  </Link>
);

const FullScreenToggle = () => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <FontAwesomeIcon
      icon={faExpand}
      onClick={toggleFullScreen}
      className="hover:text-primary cursor-pointer transition-all dark:text-white md:block hidden"
      width={20}
      height={20}
    />
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
        <input
          type="checkbox"
          id="dark-toggle"
          className="checkbox hidden"
          checked={isDarkMode}
          onChange={handleToggle}
        />
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
      <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} className="text-white" width={16} height={16} />
    </div>
  </div>
);

const DarkModeLabel = ({ isDarkMode }) => (
  <div className="ml-3 font-medium text-gray-900 dark:text-[#00498e] md:block hidden">
    {isDarkMode ? 'Dark' : 'Light'}
  </div>
);

export default TopBarPage;
