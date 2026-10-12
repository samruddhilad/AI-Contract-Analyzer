import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import type { ChatMessageItem } from '../types/contract';
import { SourceSection } from './SourceSection';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isAi = message.sender === 'ai';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isAi ? 'row' : 'row-reverse',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '18px',
        width: '100%',
      }}
    >
      {/* Avatar Icon */}
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          backgroundColor: isAi ? 'var(--color-primary)' : 'var(--color-secondary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isAi ? <Bot size={18} /> : <User size={18} />}
      </div>

      {/* Message Bubble Container */}
      <div
        style={{
          maxWidth: '82%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isAi ? 'flex-start' : 'flex-end',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderRadius: isAi
              ? '4px 18px 18px 18px'
              : '18px 4px 18px 18px',
            backgroundColor: isAi
              ? 'var(--color-bg-surface-subtle)'
              : 'var(--color-primary)',
            color: isAi
              ? 'var(--color-text-primary)'
              : '#ffffff',
            border: isAi ? '1px solid var(--color-border-subtle)' : 'none',
            boxShadow: 'var(--shadow-xs)',
            fontSize: '0.92rem',
            lineHeight: '1.6',
            position: 'relative',
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.text}
          </div>

          {/* Document citations if available */}
          {isAi && message.sources && message.sources.length > 0 && (
            <SourceSection sources={message.sources} />
          )}
        </div>

        {/* Footer info & copy button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '4px',
            padding: '0 4px',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{message.timestamp}</span>

          {isAi && (
            <button
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check size={12} color="var(--color-risk-low)" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
