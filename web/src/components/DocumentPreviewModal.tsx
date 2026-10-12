import React, { useState } from 'react';
import { X, Copy, Check, Search, FileText } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename?: string;
  cleanText: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  filename = 'Document',
  cleanText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple highlight helper
  const renderHighlightedText = () => {
    if (!searchTerm.trim()) {
      return cleanText;
    }
    const parts = cleanText.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark
          key={i}
          style={{
            backgroundColor: '#fef08a',
            color: '#713f12',
            padding: '2px 0',
            borderRadius: '2px',
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card-elevated"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '85vh',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>{filename}</h3>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
              Extracted Text Preview
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              title="Copy extracted document text"
            >
              {copied ? <Check size={14} color="var(--color-risk-low)" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search text in document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Content Viewer */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-family-mono)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          {renderHighlightedText()}
        </div>
      </div>
    </div>
  );
};
