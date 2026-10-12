import React, { useState } from 'react';
import {
  FileText,
  MessageSquareText,
  Calendar,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useContract } from '../context/ContractContext';
import { SummaryCard } from '../components/SummaryCard';
import { EntityCard } from '../components/EntityCard';
import { ClauseCard } from '../components/ClauseCard';
import { RiskCard } from '../components/RiskCard';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { EmptyState } from '../components/EmptyState';

export const AnalysisView: React.FC = () => {
  const { activeContract, navigateTo } = useContract();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!activeContract) {
    return (
      <div className="card" style={{ marginTop: '40px', padding: '48px 24px' }}>
        <EmptyState
          icon={FileText}
          title="No Contract Selected"
          description="Upload a contract or select one from My Contracts to view complete analysis results."
          actionText="Upload Contract"
          onAction={() => navigateTo('upload')}
        />
      </div>
    );
  }

  const confidencePercent = Math.round(
    (activeContract.contract_type?.confidence || 0) * 100
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      {/* Top Document Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '24px',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          borderLeft: '4px solid var(--color-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                {activeContract.filename || 'Contract Document'}
              </h1>
              <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                {activeContract.contract_type?.contract_type || 'Commercial Contract'}
              </span>
              <span className="badge badge-low" style={{ fontSize: '0.8rem' }}>
                {confidencePercent}% Confidence
              </span>
            </div>

            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Calendar size={13} />
              <span>
                Analyzed on{' '}
                {activeContract.analyzed_at
                  ? new Date(activeContract.analyzed_at).toLocaleString()
                  : new Date().toLocaleDateString()}
              </span>
              {activeContract.chunk_count && (
                <>
                  <span>•</span>
                  <span>{activeContract.chunk_count} text chunks indexed</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {activeContract.clean_text && (
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="btn btn-secondary"
            >
              <Eye size={16} />
              <span>View Document Text</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('ask_ai')}
            className="btn btn-primary"
          >
            <MessageSquareText size={16} />
            <span>Ask AI About This Contract</span>
          </button>
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <SummaryCard
        summary={activeContract.summary}
        contractType={activeContract.contract_type?.contract_type}
        confidence={activeContract.contract_type?.confidence}
      />

      {/* Extraction limitation notice if present */}
      {activeContract.limitations && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--color-risk-medium-bg)',
            border: '1px solid var(--color-risk-medium-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: 'var(--color-risk-medium)',
          }}
        >
          ⚠️ {activeContract.limitations}
        </div>
      )}

      {/* Section 2: Key Extracted Information */}
      <EntityCard entities={activeContract.entities || {}} />

      {/* Section 3: Important Clauses */}
      <ClauseCard clauses={activeContract.clauses || {}} isContract={activeContract.is_contract} />

      {/* Section 4: Risk & Attention Points */}
      <RiskCard riskAnalysis={activeContract.risk_analysis} />

      {/* Sticky Bottom CTA to Ask AI */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          border: '1px solid var(--color-primary-muted)',
          background:
            'linear-gradient(90deg, var(--color-bg-surface) 0%, var(--color-primary-light) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={24} color="var(--color-primary)" />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              Have specific questions about this agreement?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Ask anything (termination terms, penalties, payments) and receive SLM answers grounded in this contract.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('ask_ai')}
          className="btn btn-primary"
        >
          <MessageSquareText size={16} />
          <span>Launch Ask AI</span>
        </button>
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
