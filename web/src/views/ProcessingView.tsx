import React from 'react';
import { useContract } from '../context/ContractContext';
import { ProcessingSteps } from '../components/ProcessingSteps';

export const ProcessingView: React.FC = () => {
  const { processingStep, processingStageText, progressPercent, activeFile, cancelAnalysis } = useContract();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        paddingTop: '30px',
      }}
    >
      {activeFile && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          Currently analyzing:{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{activeFile.name}</strong>
        </div>
      )}

      <ProcessingSteps
        currentStep={processingStep}
        progressPercent={progressPercent}
        stageText={processingStageText}
      />

      <button
        onClick={cancelAnalysis}
        className="btn btn-secondary btn-sm"
        style={{ marginTop: '8px' }}
      >
        Cancel Analysis & Return
      </button>
    </div>
  );
};
