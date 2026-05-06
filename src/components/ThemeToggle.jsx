import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const STORAGE_KEY = 'assetMgmtTheme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-50 group inline-flex items-center justify-center w-10 h-10 rounded-full shadow-lg
                 bg-white/90 text-gray-700 hover:bg-white hover:scale-110
                 dark:bg-gray-800/90 dark:text-yellow-300 dark:hover:bg-gray-800
                 backdrop-blur ring-1 ring-black/5 dark:ring-white/10
                 transition-all duration-200 active:scale-95"
    >
      <span key={isDark ? 'sun' : 'moon'} className="inline-flex animate-scale-in">
        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </span>
    </button>
  );
};

export default ThemeToggle;
