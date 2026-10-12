import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface RiskCardProps {
  riskAnalysis: string;
}

export const RiskCard: React.FC<RiskCardProps> = ({ riskAnalysis }) => {
  // Parse paragraphs or items from riskAnalysis string
  const rawSections = riskAnalysis
    .split(/\n\s*\n|\n(?=[0-9]+\.|\*|-|•|[A-Z][a-z]+:)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const getSeverityBadge = (text: string, index: number) => {
    const lower = text.toLowerCase();
    if (
      lower.includes('high') ||
      lower.includes('critical') ||
      lower.includes('unilateral') ||
      lower.includes('penalty') ||
      lower.includes('indemnif') ||
      index === 0
    ) {
      return {
        type: 'high',
        label: 'Attention Required',
        badgeClass: 'badge-high',
        icon: <AlertOctagon size={14} />,
      };
    }
    if (
      lower.includes('ambigu') ||
      lower.includes('unclear') ||
      lower.includes('concern') ||
      lower.includes('automatic') ||
      lower.includes('short') ||
      index === 1
    ) {
      return {
        type: 'medium',
        label: 'Review Carefully',
        badgeClass: 'badge-medium',
        icon: <AlertTriangle size={14} />,
      };
    }
    return {
      type: 'info',
      label: 'Important Clause',
      badgeClass: 'badge-primary',
      icon: <Info size={14} />,
    };
  };

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
              backgroundColor: 'var(--color-risk-medium-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-risk-medium)',
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Risk & Attention Points</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              SLM evaluated risks, unfavorable terms, and ambiguous provisions
            </p>
          </div>
        </div>

        <span className="badge badge-medium" style={{ fontSize: '0.78rem' }}>
          {rawSections.length} Items Highlighted
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {rawSections.map((section, idx) => {
          const badge = getSeverityBadge(section, idx);
          return (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${badge.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {section}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '4px',
          padding: '10px 14px',
          backgroundColor: 'var(--color-bg-surface-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span>
          Risk points are AI-generated for informational review and legal risk scoping. Consult legal counsel for formal compliance determinations.
        </span>
      </div>
    </div>
  );
};
