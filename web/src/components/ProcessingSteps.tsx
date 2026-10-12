import React from 'react';
import { CheckCircle2, Loader2, Circle, Sparkles } from 'lucide-react';
import { PROCESSING_STAGES } from '../context/ContractContext';

interface ProcessingStepsProps {
  currentStep: number;
  progressPercent?: number;
  stageText?: string;
}

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ currentStep, progressPercent = 10, stageText }) => {
  const isFinalStep = currentStep >= PROCESSING_STAGES.length - 1 || progressPercent >= 100;
  const displayStage = stageText || PROCESSING_STAGES[currentStep] || 'Processing...';

  return (
    <div
      className="card"
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '32px',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Header with Title and Current Stage Status */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '14px',
          }}
        >
          <Sparkles size={15} />
          <span>Active Pipeline: LexiGuard AI (Qwen2.5-1.5B)</span>
        </div>

        <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
          Analyzing Document
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
          Extracting text, identifying entities, categorizing document structure, and running local SLM reasoning.
        </p>

        {/* Live Progress Bar Container */}
        <div style={{ marginTop: '20px', marginBottom: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <span style={{ color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!isFinalStep && <Loader2 size={13} color="var(--color-primary)" className="pulse" />}
              {isFinalStep ? 'Complete' : 'Overall Progress'}
            </span>
            <span style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
              {Math.round(progressPercent)}%
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--color-border-subtle)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(5, progressPercent))}%`,
                height: '100%',
                backgroundColor: isFinalStep ? 'var(--color-risk-low)' : 'var(--color-primary)',
                borderRadius: '999px',
                transition: 'width 0.4s ease-in-out, background-color 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Dynamic Stage Pill */}
        <div
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          {isFinalStep ? (
            <CheckCircle2 size={16} color="var(--color-risk-low)" />
          ) : (
            <Loader2 size={16} color="var(--color-primary)" className="pulse" />
          )}
          <span>Current Task: {displayStage}</span>
        </div>
      </div>

      {/* Discrete Verified Stages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PROCESSING_STAGES.map((stage, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isCurrent
                  ? 'var(--color-primary-light)'
                  : isDone
                  ? 'var(--color-bg-surface-subtle)'
                  : 'transparent',
                border: isCurrent
                  ? '1px solid var(--color-primary-muted)'
                  : '1px solid transparent',
                transition: 'all var(--transition-normal)',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {isDone ? (
                  <CheckCircle2 size={18} color="var(--color-risk-low)" />
                ) : isCurrent ? (
                  <Loader2 size={18} color="var(--color-primary)" className="pulse" />
                ) : (
                  <Circle size={18} color="var(--color-border-strong)" />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 600 : isDone ? 500 : 400,
                    color: isCurrent
                      ? 'var(--color-primary)'
                      : isDone
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                  }}
                >
                  {stage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
