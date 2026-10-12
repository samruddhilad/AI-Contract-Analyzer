import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Upload,
  FileText,
  Calendar,
  MessageSquareText,
  BarChart3,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useContract } from '../context/ContractContext';
import { EmptyState } from '../components/EmptyState';

export const MyContractsView: React.FC = () => {
  const {
    contractHistory,
    selectContractFromHistory,
    deleteContract,
    navigateTo,
  } = useContract();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = contractHistory.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.filename.toLowerCase().includes(term) ||
      c.contract_type.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Search */}
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
          <h1 style={{ fontSize: '1.85rem' }}>My Contracts</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Browse past contract analyses, review risk assessments, or resume AI inquiries.
          </p>
        </div>

        <button
          onClick={() => navigateTo('upload')}
          className="btn btn-primary"
        >
          <Upload size={16} />
          <span>Upload New Contract</span>
        </button>
      </div>

      {/* Search Bar */}
      {contractHistory.length > 0 && (
        <div
          style={{
            position: 'relative',
            maxWidth: '480px',
            width: '100%',
          }}
        >
          <Search
            size={18}
            color="var(--color-text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by contract name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
            }}
          />
        </div>
      )}

      {/* Contract List */}
      {contractHistory.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px' }}>
          <EmptyState
            icon={FileSpreadsheet}
            title="No Saved Contracts"
            description="You have not analyzed any contracts yet. Upload your first PDF, DOCX, or TXT document to begin."
            actionText="Upload Contract"
            onAction={() => navigateTo('upload')}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            No contracts matched "{searchTerm}".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} />
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.filename}</h4>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                      {item.contract_type}
                    </span>
                    <span>•</span>
                    <span className="badge badge-low" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={10} />
                      <span>{Math.round(item.confidence * 100)}% Match</span>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{new Date(item.analyzed_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => selectContractFromHistory(item)}
                  className="btn btn-secondary btn-sm"
                  title="View full analysis dashboard"
                >
                  <BarChart3 size={14} />
                  <span>Analysis</span>
                </button>

                <button
                  onClick={() => {
                    selectContractFromHistory(item);
                    navigateTo('ask_ai');
                  }}
                  className="btn btn-primary btn-sm"
                  title="Ask questions about this contract"
                >
                  <MessageSquareText size={14} />
                  <span>Ask AI</span>
                </button>

                <button
                  onClick={() => deleteContract(item.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-risk-high)', padding: '8px' }}
                  title="Delete contract"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
