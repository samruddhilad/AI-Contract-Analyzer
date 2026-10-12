import React, { useState } from 'react';
import { Send, Trash2, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onClearChat?: () => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'What is the notice period for termination?',
  'Can either party terminate this agreement early?',
  'What are the payment amounts and terms?',
  'Is there an automatic renewal clause?',
  'What happens in case of breach or default?',
  'Who are the named parties and governing law?',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onClearChat,
  disabled = false,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleChipClick = (question: string) => {
    if (isLoading || disabled) return;
    onSendMessage(question);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '16px 20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* Suggested Question Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="var(--color-primary)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Suggested Inquiries
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(q)}
              disabled={isLoading || disabled}
              className="badge badge-neutral"
              style={{
                cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.76rem',
                padding: '6px 12px',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-surface-subtle)',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box and Actions */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              disabled
                ? 'Upload a contract to ask questions...'
                : 'Ask anything about this document (e.g., notice periods, penalties)...'
            }
            disabled={disabled || isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              paddingRight: '40px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border-strong)',
              backgroundColor: 'var(--color-bg-surface)',
              fontSize: '0.92rem',
            }}
          />
        </div>

        {onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-muted)',
            }}
            title="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
        )}

        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="btn btn-primary"
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '12px 20px',
            minWidth: '46px',
          }}
          title="Send inquiry"
        >
          {isLoading ? (
            <Loader2 size={18} className="pulse" />
          ) : (
            <>
              <span>Ask</span>
              <Send size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
