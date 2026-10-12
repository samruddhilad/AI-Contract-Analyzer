import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SourceSectionProps {
  sources: string[];
}

export const SourceSection: React.FC<SourceSectionProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '10px',
        borderTop: '1px solid var(--color-border-subtle)',
        paddingTop: '8px',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <BookOpen size={14} />
        <span>
          Sources from document ({sources.length} excerpt{sources.length > 1 ? 's' : ''})
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {sources.map((source, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderLeft: '3px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.5',
                fontStyle: 'italic',
                maxHeight: '160px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '4px',
                  fontStyle: 'normal',
                }}
              >
                Section Excerpt #{i + 1}
              </div>
              "{source.trim()}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
