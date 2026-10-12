import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
  contractType?: string;
  confidence?: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  contractType,
  confidence,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format raw summary lines
  const lines = summary.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Executive Summary</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Synthesized by Qwen2.5-1.5B-Instruct SLM
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-secondary btn-sm"
          title="Copy summary to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} color="var(--color-risk-low)" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {contractType && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 14px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>Detected Classification:</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {contractType}
          </span>
          {confidence !== undefined && (
            <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
              {Math.round(confidence * 100)}% Match
            </span>
          )}
        </div>
      )}

      {/* Summary Content Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.92rem',
          lineHeight: '1.6',
          color: 'var(--color-text-primary)',
        }}
      >
        {lines.map((line, i) => {
          const isHeader =
            /^\d+\.\s+/.test(line) ||
            /^(Parties|Duration|Payment|Main obligations|Termination|Important risks):/i.test(line);

          if (isHeader) {
            return (
              <div
                key={i}
                style={{
                  marginTop: i > 0 ? '6px' : 0,
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                }}
              >
                <span>{line}</span>
              </div>
            );
          }

          return (
            <p key={i} style={{ color: 'var(--color-text-secondary)', paddingLeft: '4px' }}>
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
};
