import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Scale,
  Info,
} from 'lucide-react';
import type { ClauseMap } from '../types/contract';

interface ClauseCardProps {
  clauses: ClauseMap;
  isContract?: boolean;
}

interface ClauseDefinition {
  key: string;
  name: string;
  description: string;
}

const STANDARD_CLAUSES: ClauseDefinition[] = [
  {
    key: 'termination',
    name: 'Termination',
    description: 'Procedures, notice periods, and triggers for ending the contract.',
  },
  {
    key: 'payment',
    name: 'Payment & Invoicing',
    description: 'Fees, payment cycles, penalties, and billing schedules.',
  },
  {
    key: 'confidentiality',
    name: 'Confidentiality',
    description: 'Protection of proprietary data and non-disclosure obligations.',
  },
  {
    key: 'liability',
    name: 'Limitation of Liability',
    description: 'Caps on damages, indemnification clauses, and mutual waivers.',
  },
  {
    key: 'renewal',
    name: 'Renewal & Extension',
    description: 'Automatic renewal windows, opt-outs, and extension mechanics.',
  },
  {
    key: 'governing_law',
    name: 'Governing Law & Jurisdiction',
    description: 'Applicable legal jurisdiction and dispute resolution forum.',
  },
  {
    key: 'intellectual_property',
    name: 'Intellectual Property',
    description: 'Ownership of deliverables, patents, copyrights, and licenses.',
  },
  {
    key: 'non_compete',
    name: 'Non-Compete & Non-Solicit',
    description: 'Restrictions against competitive activities or soliciting employees/clients.',
  },
  {
    key: 'data_privacy',
    name: 'Data Privacy & Security',
    description: 'Compliance with GDPR, HIPAA, or personal data handling requirements.',
  },
];

export const ClauseCard: React.FC<ClauseCardProps> = ({ clauses, isContract = true }) => {
  // Normalize clause lookup
  const isClauseDetected = (key: string): boolean => {
    for (const [clauseName, val] of Object.entries(clauses)) {
      const normalizedName = clauseName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'object' && val !== null && 'detected' in val) {
          return Boolean(val.detected);
        }
        if (typeof val === 'string') {
          return val.toLowerCase() === 'true' || val.toLowerCase() === 'detected';
        }
        return true;
      }
    }
    return false;
  };

  const detectedCount = STANDARD_CLAUSES.filter((c) => isClauseDetected(c.key)).length;

  if (isContract === false && detectedCount === 0) {
    return (
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'var(--color-bg-surface-subtle)' }}>
        <Info size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Non-Contract Document</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            This document is recognized as a non-legal file. Standard contractual clauses (such as termination, indemnity, and governing law) do not apply.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <Scale size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Important Clause Detection</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Automated NLP recognition for critical legal provisions
            </p>
          </div>
        </div>

        <span
          className="badge badge-primary"
          style={{ fontSize: '0.82rem', padding: '4px 12px' }}
        >
          {detectedCount} of {STANDARD_CLAUSES.length} Detected
        </span>
      </div>

      <div className="grid-3" style={{ gap: '16px' }}>
        {STANDARD_CLAUSES.map((clause) => {
          const detected = isClauseDetected(clause.key);

          return (
            <div
              key={clause.key}
              className="card"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                borderLeft: detected
                  ? '3px solid var(--color-risk-low)'
                  : '3px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{clause.name}</h4>
                  {detected ? (
                    <span className="badge badge-low" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Detected</span>
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      <XCircle size={12} />
                      <span>Not detected</span>
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  {clause.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
