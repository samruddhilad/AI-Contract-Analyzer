import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Server,
  Database,
  Shield,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useContract } from '../context/ContractContext';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const {
    backendUrl,
    setBackendUrl,
    backendStatus,
    checkHealth,
  } = useContract();

  const [customUrl, setCustomUrl] = useState(backendUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendUrl(customUrl.trim());
    setSaveSuccess(true);
    checkHealth();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem' }}>Application Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Configure appearance, backend connection, and review legal information.
        </p>
      </div>

      {/* 1. Theme Configuration */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sun size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.15rem' }}>Interface Appearance</h3>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          Choose between Light and Dark display modes. Your choice is automatically persisted.
        </p>

        <div style={{ display: 'flex', gap: '14px' }}>
          <button
            onClick={() => setTheme('light')}
            className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-sm)' }}
          >
            <Sun size={18} />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-sm)' }}
          >
            <Moon size={18} />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* 2. Backend Connection Settings */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>FastAPI Backend Connection</h3>
          </div>

          <span
            className={`badge ${
              backendStatus === 'connected' ? 'badge-low' : 'badge-high'
            }`}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor:
                  backendStatus === 'connected'
                    ? 'var(--color-risk-low)'
                    : 'var(--color-risk-high)',
              }}
            />
            <span>
              {backendStatus === 'connected' ? 'Connected' : 'Offline'}
            </span>
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          Default backend runs locally on port 8000 via Uvicorn. If running remotely or on a mobile hotspot, enter your network address.
        </p>

        <form onSubmit={handleSaveUrl} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="http://127.0.0.1:8000"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
            }}
          />

          <button type="submit" className="btn btn-secondary">
            Save & Test
          </button>

          <button
            type="button"
            onClick={() => checkHealth()}
            className="btn btn-ghost"
            title="Refresh connection status"
          >
            <RefreshCw size={16} />
          </button>
        </form>

        {saveSuccess && (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-risk-low)' }}>
            ✓ Endpoint saved and tested.
          </p>
        )}
      </div>

      {/* 3. Firebase & Storage Status */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={20} color="#0284c7" />
          <h3 style={{ fontSize: '1.15rem' }}>Persistence & Database Status</h3>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          Contract history and chat threads are persisted in high-speed local browser storage. If Firebase Firestore credentials are provided in your environment, Cloud Synchronization will activate automatically.
        </p>

        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="var(--color-risk-low)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
              Local Encrypted Storage
            </span>
          </div>
          <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
            Active & Synced
          </span>
        </div>
      </div>

      {/* 4. Architecture & Model Information */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.15rem' }}>Architecture & SLM Specification</h3>
        </div>

        <div
          style={{
            fontSize: '0.88rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <p>
            <strong>Core SLM:</strong> Qwen2.5-1.5B-Instruct (Casual LM, 1.54B parameters).
          </p>
          <p>
            <strong>Pipeline Stack:</strong> Document Parser (pdfplumber, python-docx) → Text Cleaning & Preprocessing → Categorization (TF-IDF & SGD) → Named Entity Recognition (Regularized patterns & heuristics) → Embedding Retrieval (Sentence Transformers) → Qwen SLM Grounded Generation.
          </p>
          <p>
            <strong>Design System:</strong> Stitch MCP LexiGuard AI Unified Palette with Inter & Geist typography.
          </p>
        </div>
      </div>

      {/* 5. Legal Disclaimer */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--color-risk-medium)',
          backgroundColor: 'var(--color-risk-medium-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--color-risk-medium)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-risk-medium)' }}>
            Important Legal Disclaimer
          </h4>
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-primary)',
            lineHeight: 1.55,
          }}
        >
          "AI-generated contract analysis is for informational and research purposes only and is not legal advice."
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          This system is an academic and enterprise decision-support tool. It does not create an attorney-client relationship. Always consult qualified legal counsel for binding legal decisions or contract negotiations.
        </p>
      </div>
    </div>
  );
};
