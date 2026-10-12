import React from 'react';
import { Home, Upload, FileSpreadsheet, MessageSquareText, Settings } from 'lucide-react';
import { useContract } from '../context/ContractContext';
import type { ViewType } from '../types/contract';

export const BottomNav: React.FC = () => {
  const { currentView, navigateTo, activeContract } = useContract();

  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'upload', label: 'Upload', icon: <Upload size={20} /> },
    { id: 'my_contracts', label: 'Contracts', icon: <FileSpreadsheet size={20} /> },
    { id: 'ask_ai', label: 'Ask AI', icon: <MessageSquareText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'none', // Shown on mobile via media query below
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 30,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}
      className="mobile-bottom-nav"
    >
      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
      `}</style>
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const isAskAi = item.id === 'ask_ai';
        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '0.72rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {isAskAi && activeContract && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '12px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-risk-low)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
