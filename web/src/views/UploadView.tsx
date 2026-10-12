import React from 'react';
import { Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { useContract } from '../context/ContractContext';

export const UploadView: React.FC = () => {
  const { error, clearError, checkHealth, backendStatus } = useContract();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        paddingTop: '20px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
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
            margin: '0 auto 16px auto',
          }}
        >
          <Upload size={24} />
        </div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Upload Contract Document</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Upload your legal contract in PDF, Microsoft Word (DOCX), or Plain Text (TXT) format. The document will be analyzed locally using our NLP and Qwen2.5-1.5B-Instruct pipeline.
        </p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            padding: '16px 20px',
            backgroundColor: 'var(--color-risk-high-bg)',
            border: '1px solid var(--color-risk-high-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            color: 'var(--color-risk-high)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Analysis Error</p>
              <p style={{ fontSize: '0.88rem', marginTop: '2px', color: 'var(--color-text-primary)' }}>
                {error}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {backendStatus === 'offline' && (
              <button
                onClick={() => checkHealth()}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                <RefreshCw size={12} />
                <span>Retry Connection</span>
              </button>
            )}
            <button
              onClick={clearError}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-risk-high)', fontSize: '0.78rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* File Dropzone / Selector */}
      <FileUploader />

      {/* Security & Confidentiality Notice */}
      <div
        className="card"
        style={{
          maxWidth: '680px',
          width: '100%',
          padding: '16px 20px',
          backgroundColor: 'var(--color-bg-surface-subtle)',
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          🔒 Privacy & Processing Notice
        </p>
        <p>
          Uploaded documents are processed by your local FastAPI server and Qwen2.5-1.5B Small Language Model. Documents are not shared with external third-party model providers.
        </p>
      </div>
    </div>
  );
};
