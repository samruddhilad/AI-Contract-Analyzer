import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary btn-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
      }}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} color="var(--color-text-secondary)" />
          {showLabel && <span>Dark</span>}
        </>
      ) : (
        <>
          <Sun size={16} color="#fbbf24" />
          {showLabel && <span>Light</span>}
        </>
      )}
    </button>
  );
};
