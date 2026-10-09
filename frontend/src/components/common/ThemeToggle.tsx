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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {showLabel && (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      
      {/* iOS style toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`relative inline-flex h-[31px] w-[51px] flex-shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus:outline-none ${
          isDark
            ? 'bg-[#34C759]' // Authentic iOS active green
            : 'bg-[#E9E9EB] dark:bg-slate-700' // Authentic iOS off/light gray
        }`}
      >
        <span className="sr-only">Toggle dark and light mode</span>

        {/* Subtle background icons for affordance */}
        <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <Sun
            className={`w-3 h-3 text-amber-500 transition-opacity duration-200 ${
              isDark ? 'opacity-0' : 'opacity-70'
            }`}
          />
          <Moon
            className={`w-3 h-3 text-white transition-opacity duration-200 ${
              isDark ? 'opacity-90' : 'opacity-0'
            }`}
          />
        </span>

        {/* iOS style sliding thumb */}
        <span
          className={`pointer-events-none inline-flex items-center justify-center h-[27px] w-[27px] transform rounded-full bg-white transition duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] active:w-[31px] z-10 ${
            isDark ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
          style={{
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16), 0 3px 1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-[#34C759]" fill="currentColor" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
          )}
        </span>
      </button>
    </div>
  );
};
