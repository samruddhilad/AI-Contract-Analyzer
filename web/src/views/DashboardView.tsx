import React from 'react';
import {
  Upload,
  FileSpreadsheet,
  BarChart3,
  Clock,
  ArrowRight,
  FileText,
  MessageSquareText,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useContract } from '../context/ContractContext';
import { EmptyState } from '../components/EmptyState';

export const DashboardView: React.FC = () => {
  const {
    contractHistory,
    activeContract,
    navigateTo,
    selectContractFromHistory,
    deleteContract,
    backendStatus,
  } = useContract();

  const totalAnalyzed = contractHistory.length;
  const latestContract = contractHistory[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner & Quick Upload */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Contract Intelligence Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Monitor analyzed agreements, review risk profiles, and query documents.
          </p>
        </div>

        <button
          onClick={() => navigateTo('upload')}
          className="btn btn-primary"
          style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)' }}
        >
          <Upload size={18} />
          <span>Quick Upload</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid-3">
        {/* Metric 1: Total Analyzed */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              TOTAL CONTRACTS
            </p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{totalAnalyzed}</h3>
          </div>
        </div>

        {/* Metric 2: Backend Status */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor:
                backendStatus === 'connected'
                  ? 'var(--color-risk-low-bg)'
                  : 'var(--color-risk-high-bg)',
              color:
                backendStatus === 'connected'
                  ? 'var(--color-risk-low)'
                  : 'var(--color-risk-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              AI PIPELINE STATUS
            </p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {backendStatus === 'connected'
                ? 'Online & Ready'
                : backendStatus === 'checking'
                ? 'Connecting...'
                : 'Offline'}
            </h3>
          </div>
        </div>

        {/* Metric 3: Active Document */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: activeContract
                ? 'var(--color-bg-surface-subtle)'
                : 'var(--color-bg-surface-subtle)',
              color: activeContract ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={24} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              ACTIVE CONTRACT
            </p>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeContract ? activeContract.filename : 'None selected'}
            </h3>
          </div>
        </div>
      </div>

      {/* Latest Analysis Feature Box */}
      {latestContract ? (
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} color="var(--color-primary)" />
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Latest Document Analysis</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {latestContract.filename} • Analyzed on{' '}
                  {new Date(latestContract.analyzed_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => selectContractFromHistory(latestContract)}
                className="btn btn-secondary btn-sm"
              >
                <span>View Analysis</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  selectContractFromHistory(latestContract);
                  navigateTo('ask_ai');
                }}
                className="btn btn-primary btn-sm"
              >
                <MessageSquareText size={14} />
                <span>Ask AI</span>
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '4px',
                  fontWeight: 600,
                }}
              >
                CONTRACT TYPE
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                  {latestContract.contract_type}
                </span>
                <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                  {Math.round(latestContract.confidence * 100)}% Confidence
                </span>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '4px',
                  fontWeight: 600,
                }}
              >
                ANALYSIS STATUS
              </p>
              <span className="badge badge-low">
                <CheckCircle2 size={13} />
                <span>SLM Processed</span>
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-bg-surface-subtle)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              maxHeight: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {latestContract.summary.substring(0, 320)}...
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '36px 20px' }}>
          <EmptyState
            icon={Upload}
            title="No Contracts Analyzed Yet"
            description="Upload your first commercial lease, employment agreement, NDA, or service contract to view insights here."
            actionText="Upload Contract"
            onAction={() => navigateTo('upload')}
          />
        </div>
      )}

      {/* Recent Contracts Table/List */}
      {contractHistory.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--color-text-muted)" />
              <h3 style={{ fontSize: '1.1rem' }}>Recent Contract History</h3>
            </div>

            <button
              onClick={() => navigateTo('my_contracts')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.85rem' }}
            >
              <span>View All ({contractHistory.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contractHistory.slice(0, 5).map((contract) => (
              <div
                key={contract.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <FileText size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {contract.filename}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {contract.contract_type} • {new Date(contract.analyzed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => selectContractFromHistory(contract)}
                    className="btn btn-secondary btn-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => {
                      selectContractFromHistory(contract);
                      navigateTo('ask_ai');
                    }}
                    className="btn btn-primary btn-sm"
                    title="Ask AI about this contract"
                  >
                    <MessageSquareText size={14} />
                  </button>
                  <button
                    onClick={() => deleteContract(contract.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '6px', color: 'var(--color-risk-high)' }}
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
