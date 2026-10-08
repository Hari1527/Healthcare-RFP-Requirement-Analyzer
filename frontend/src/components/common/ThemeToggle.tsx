import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full p-0.5 border transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
          isDark
            ? 'bg-slate-800 border-slate-700 focus:ring-offset-slate-900'
            : 'bg-slate-200 border-slate-300 focus:ring-offset-white'
        }`}
      >
        <span className="sr-only">Toggle dark & light mode</span>
        {/* Track icons */}
        <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
          <Sun className={`w-3 h-3 text-amber-500 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
          <Moon className={`w-3 h-3 text-slate-400 dark:text-brand-300 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
        </span>
        {/* Sliding thumb knob */}
        <span
          className={`pointer-events-none inline-flex items-center justify-center h-5.5 w-5.5 transform rounded-full bg-white dark:bg-brand-600 shadow-md ring-0 transition duration-300 ease-in-out z-10 ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-white fill-current" />
          ) : (
            <Sun className="w-3 h-3 text-amber-500 fill-amber-500" />
          )}
        </span>
      </button>
    </div>
  );
};
