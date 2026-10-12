import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useContract } from '../context/ContractContext';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.txt',
  '.csv',
  '.xlsx',
  '.pptx',
  '.md',
  '.html',
  '.htm',
];

export const FileUploader: React.FC = () => {
  const { startAnalysis, isAnalyzing, backendStatus } = useContract();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndSetFile = (file: File) => {
    setValidationError(null);
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setValidationError(
        `Unsupported file type "${ext}". Supported formats: PDF, DOCX, TXT, CSV, XLSX, PPTX, Markdown (.md), and HTML.`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setValidationError('The selected file is empty (0 bytes). Please upload a valid document.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('File size exceeds the 25MB limit. Please upload a smaller document.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadAndAnalyze = () => {
    if (!selectedFile || isAnalyzing || isSubmitting) return;
    setIsSubmitting(true);
    startAnalysis(selectedFile).finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx,.md,.html,.htm"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload-input"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${
              dragActive ? 'var(--color-primary)' : 'var(--color-border-strong)'
            }`,
            backgroundColor: dragActive
              ? 'var(--color-primary-light)'
              : 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <UploadCloud size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
              Drag & Drop your document here
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Supports PDF, DOCX, TXT, CSV, XLSX, PPTX, Markdown, and HTML up to 25MB
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            style={{ marginTop: '6px' }}
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={22} />
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.95rem',
                  }}
                >
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {formatFileSize(selectedFile.size)} •{' '}
                  {selectedFile.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemove}
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px', color: 'var(--color-text-muted)' }}
              title="Remove file"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleRemove}
              className="btn btn-secondary"
              disabled={isAnalyzing}
            >
              Cancel
            </button>
            <button
              onClick={handleUploadAndAnalyze}
              className="btn btn-primary"
              disabled={isAnalyzing || isSubmitting || backendStatus === 'offline'}
            >
              <span>{isAnalyzing || isSubmitting ? 'Analyzing...' : 'Start AI Analysis'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-risk-high-bg)',
            border: '1px solid var(--color-risk-high-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--color-risk-high)',
            fontSize: '0.88rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {backendStatus === 'offline' && (
        <p
          style={{
            marginTop: '12px',
            fontSize: '0.82rem',
            color: 'var(--color-risk-high)',
            textAlign: 'center',
          }}
        >
          FastAPI backend is offline (http://127.0.0.1:8000). Please start the backend before uploading.
        </p>
      )}
    </div>
  );
};
