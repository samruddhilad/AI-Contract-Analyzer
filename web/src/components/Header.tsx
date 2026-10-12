import React from 'react';
import { FileText, Menu, ShieldCheck } from 'lucide-react';
import { useContract } from '../context/ContractContext';
import { BackendStatus } from './BackendStatus';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { activeContract, navigateTo } = useContract();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 20,
      }}
    >
      {/* Left: Mobile hamburger & Document Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-sm"
            style={{ padding: '8px', display: 'flex' }}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}

        {activeContract ? (
          <div
            onClick={() => navigateTo('analysis')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              maxWidth: '380px',
            }}
            title="Click to view Analysis Results"
          >
            <FileText size={16} color="var(--color-primary)" />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeContract.filename || 'Active Document'}
            </span>
            <span
              className="badge badge-primary"
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              {activeContract.contract_type?.contract_type || 'Contract'}
            </span>
          </div>
        ) : (
          <div
            onClick={() => navigateTo('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={22} color="var(--color-primary)" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              LexiGuard <span style={{ color: 'var(--color-primary)' }}>AI</span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Backend Status & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <BackendStatus />
        <ThemeToggle />
      </div>
    </header>
  );
};
