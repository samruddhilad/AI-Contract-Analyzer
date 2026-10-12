import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useContract } from '../context/ContractContext';

export const BackendStatus: React.FC = () => {
  const { backendStatus, checkHealth } = useContract();

  const isConnected = backendStatus === 'connected';
  const isChecking = backendStatus === 'checking';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isConnected
          ? 'var(--color-risk-low-bg)'
          : isChecking
          ? 'var(--color-bg-surface-subtle)'
          : 'var(--color-risk-high-bg)',
        border: `1px solid ${
          isConnected
            ? 'var(--color-risk-low-border)'
            : isChecking
            ? 'var(--color-border-subtle)'
            : 'var(--color-risk-high-border)'
        }`,
        fontSize: '0.8rem',
        fontWeight: 500,
        color: isConnected
          ? 'var(--color-risk-low)'
          : isChecking
          ? 'var(--color-text-muted)'
          : 'var(--color-risk-high)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: isConnected
            ? 'var(--color-risk-low)'
            : isChecking
            ? '#94a3b8'
            : 'var(--color-risk-high)',
        }}
        className={isConnected ? 'pulse' : ''}
      />
      <span>
        {isConnected
          ? 'Backend Connected'
          : isChecking
          ? 'Connecting...'
          : 'Backend Offline'}
      </span>

      {!isConnected && !isChecking && (
        <button
          onClick={() => checkHealth()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
          }}
          title="Retry connecting to FastAPI"
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
};
