import React from 'react';
import {
  Upload,
  LayoutDashboard,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useContract } from '../context/ContractContext';

export const HomeView: React.FC = () => {
  const { navigateTo, contractHistory } = useContract();

  const featureCards = [
    {
      title: 'Smart Contract Summary',
      description:
        'SLM-synthesized executive briefings detailing parties, financial considerations, duration, and key obligations.',
      icon: <FileCheck size={24} color="var(--color-primary)" />,
    },
    {
      title: 'Important Clause Detection',
      description:
        'Automated detection of standard commercial clauses including Termination, Indemnification, Non-Compete, and Governing Law.',
      icon: <Layers size={24} color="#0284c7" />,
    },
    {
      title: 'Risk & Attention Points',
      description:
        'Identifies unfavorable terms, ambiguous provisions, unilateral rights, and high-attention clauses requiring review.',
      icon: <ShieldAlert size={24} color="var(--color-risk-medium)" />,
    },
    {
      title: 'Ask Questions Grounded in Document',
      description:
        'Dedicated interactive document Q&A. Answers strictly derived from retrieved text citations with zero hallucinations.',
      icon: <HelpCircle size={24} color="#8b5cf6" />,
    },
    {
      title: 'Multi-Contract Support',
      description:
        'Upload and organize PDF, DOCX, and TXT agreements. Review historical analyses and re-open past inquiries.',
      icon: <Sparkles size={24} color="#ec4899" />,
    },
    {
      title: 'Small Language Model Powered',
      description:
        'Built on Qwen2.5-1.5B-Instruct SLM. On-premise, secure, efficient, and ready for private enterprise and mobile deployment.',
      icon: <Cpu size={24} color="var(--color-risk-low)" />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', paddingBottom: '40px' }}>
      {/* Hero Section */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          paddingTop: '20px',
        }}
      >
        <div
          className="badge badge-primary"
          style={{
            padding: '6px 16px',
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Sparkles size={14} />
          <span>Next-Gen SLM Contract Intelligence</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            background:
              'linear-gradient(135deg, var(--color-text-primary) 40%, var(--color-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Contract Analyzer
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '680px',
          }}
        >
          Analyze contracts, understand important clauses, identify potential risks, and ask
          questions about your document using AI.
        </p>

        {/* Hero CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center',
            marginTop: '10px',
          }}
        >
          <button
            onClick={() => navigateTo('upload')}
            className="btn btn-primary btn-lg"
            style={{
              padding: '14px 28px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            <Upload size={18} />
            <span>Upload Contract</span>
          </button>

          <button
            onClick={() => navigateTo('dashboard')}
            className="btn btn-secondary btn-lg"
            style={{
              padding: '14px 28px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            <LayoutDashboard size={18} />
            <span>View Dashboard</span>
          </button>
        </div>

        {contractHistory.length > 0 && (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            You have {contractHistory.length} analyzed document{contractHistory.length > 1 ? 's' : ''}{' '}
            in history.
          </p>
        )}
      </div>

      {/* Visual Pipeline Flow */}
      <div
        className="card"
        style={{
          padding: '32px 24px',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-precision)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
            Document Analysis Pipeline
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Transparent, multi-stage processing grounded in your document text
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              flex: '1 1 220px',
              maxWidth: '260px',
              padding: '18px',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
              }}
            >
              <Upload size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Upload Document</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              PDF, DOCX, or TXT file ingestion & text extraction
            </p>
          </div>

          <ChevronRight
            size={22}
            color="var(--color-border-strong)"
            style={{ display: window.innerWidth < 768 ? 'none' : 'block' }}
          />

          {/* Step 2 */}
          <div
            style={{
              flex: '1 1 220px',
              maxWidth: '260px',
              padding: '18px',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--color-risk-low)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
              }}
            >
              <Cpu size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>AI Analysis</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              NLP classifier, entity extraction & Qwen SLM reasoning
            </p>
          </div>

          <ChevronRight
            size={22}
            color="var(--color-border-strong)"
            style={{ display: window.innerWidth < 768 ? 'none' : 'block' }}
          />

          {/* Step 3 */}
          <div
            style={{
              flex: '1 1 220px',
              maxWidth: '260px',
              padding: '18px',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--color-risk-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
              }}
            >
              <Sparkles size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Summary + Risks + Q&A</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Executive briefs, clause tags & grounded answers
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            Built for Legal Precision & Speed
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
            Engineered with a dedicated Small Language Model for reliable, document-grounded output.
          </p>
        </div>

        <div className="grid-3">
          {featureCards.map((card, i) => (
            <div
              key={i}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{card.title}</h3>

              <p
                style={{
                  fontSize: '0.88rem',
                  lineHeight: '1.55',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
        }}
      >
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem' }}>
          Ready to analyze your contract?
        </h2>
        <p style={{ color: '#e0e7ff', maxWidth: '580px', fontSize: '0.95rem' }}>
          Upload your rental lease, employment agreement, NDA, or service contract to receive immediate analysis and ask questions.
        </p>
        <button
          onClick={() => navigateTo('upload')}
          className="btn"
          style={{
            backgroundColor: '#ffffff',
            color: 'var(--color-primary)',
            padding: '12px 28px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            marginTop: '8px',
          }}
        >
          <span>Get Started Now</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
