import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  FileText,
  Sparkles,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useContract } from '../context/ContractContext';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { EmptyState } from '../components/EmptyState';

export const AskAiView: React.FC = () => {
  const {
    activeContract,
    chatMessages,
    isAsking,
    askQuestion,
    clearChat,
    navigateTo,
  } = useContract();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  if (!activeContract) {
    return (
      <div className="card" style={{ marginTop: '40px', padding: '48px 24px' }}>
        <EmptyState
          icon={MessageSquareText}
          title="No Contract Selected"
          description="To ask grounded questions with the Qwen SLM, please first upload a contract or select one from My Contracts."
          actionText="Upload Contract"
          onAction={() => navigateTo('upload')}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--header-height) - 56px)',
        minHeight: '600px',
        gap: '16px',
      }}
    >
      {/* Top Document Context Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          borderLeft: '4px solid var(--color-primary)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Target Contract:
              </span>
              <strong style={{ fontSize: '0.95rem' }}>{activeContract.filename}</strong>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                {activeContract.contract_type?.contract_type || 'Contract'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Ask anything about this specific document. Answers are strictly grounded in retrieved text.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <Eye size={14} />
            <span>View Excerpts</span>
          </button>
          <button
            onClick={() => navigateTo('analysis')}
            className="btn btn-ghost btn-sm"
          >
            <span>Back to Analysis</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Desktop: Split panel or Full chat) */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Chat Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {chatMessages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center',
                gap: '14px',
                padding: '40px 20px',
                color: 'var(--color-text-muted)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={26} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
                  Ask AI About This Contract
                </h3>
                <p style={{ fontSize: '0.88rem', maxWidth: '440px', marginTop: '6px' }}>
                  Select one of the suggested questions below or type your own question regarding notice periods, liability, obligations, or payments.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--color-risk-low)',
                  backgroundColor: 'var(--color-risk-low-bg)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-risk-low-border)',
                }}
              >
                <ShieldCheck size={14} />
                <span>Zero Hallucinations Guarantee: Answers use retrieved text citations</span>
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isAsking && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-bg-surface-subtle)',
                    borderRadius: '4px 18px 18px 18px',
                    width: 'fit-content',
                    fontSize: '0.88rem',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <Sparkles size={16} color="var(--color-primary)" className="pulse" />
                  <span>Retrieving relevant contract chunks & consulting Qwen SLM...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </>
          )}
        </div>

        {/* Chat Input Bar */}
        <ChatInput
          onSendMessage={askQuestion}
          isLoading={isAsking}
          onClearChat={chatMessages.length > 0 ? clearChat : undefined}
          disabled={!activeContract}
        />
      </div>

      {/* Document Text Preview Modal */}
      {activeContract.clean_text && (
        <DocumentPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          filename={activeContract.filename}
          cleanText={activeContract.clean_text}
        />
      )}
    </div>
  );
};
