import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type {
  AnalysisResult,
  BackendConnectionStatus,
  ChatMessageItem,
  ContractHistoryItem,
  ViewType,
} from '../types/contract';
import {
  analyzeContract,
  askContractQuestion,
  cancelAnalysisJob,
  checkBackendHealth,
} from '../api/contractApi';
import { DEFAULT_BASE_URL } from '../api/client';

export const PROCESSING_STAGES = [
  'Uploading document to server...',
  'Extracting text and document structure...',
  'Detecting document type & extracting entities...',
  'Running LexiGuard AI reasoning with Qwen2.5-1.5B...',
  'Finalizing executive summary & risk profile...',
  'Analysis complete!',
];

interface ContractContextType {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
  activeContract: AnalysisResult | null;
  activeFile: File | null;
  contractHistory: ContractHistoryItem[];
  backendStatus: BackendConnectionStatus;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isAnalyzing: boolean;
  processingStep: number;
  processingStageText: string;
  progressPercent: number;
  isAsking: boolean;
  chatMessages: ChatMessageItem[];
  error: string | null;
  clearError: () => void;
  startAnalysis: (file: File) => Promise<void>;
  cancelAnalysis: () => void;
  askQuestion: (question: string) => Promise<void>;
  clearChat: () => void;
  selectContractFromHistory: (contract: ContractHistoryItem) => void;
  deleteContract: (id: string) => void;
  checkHealth: () => Promise<void>;
  resetActiveContract: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'lexiguard_contract_history';
const BACKEND_URL_STORAGE_KEY = 'lexiguard_backend_url';

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [activeContract, setActiveContract] = useState<AnalysisResult | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    return localStorage.getItem(BACKEND_URL_STORAGE_KEY) || DEFAULT_BASE_URL;
  });
  const [backendStatus, setBackendStatus] = useState<BackendConnectionStatus>('checking');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingStageText, setProcessingStageText] = useState(PROCESSING_STAGES[0]);
  const [progressPercent, setProgressPercent] = useState<number>(5);
  const [isAsking, setIsAsking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentJobIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [contractHistory, setContractHistory] = useState<ContractHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage with quota-exceeded fallback
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(contractHistory));
    } catch {
      try {
        const leanHistory = contractHistory.map((item, idx) =>
          idx === 0 ? item : { ...item, clean_text: item.clean_text.slice(0, 10000) }
        );
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(leanHistory));
      } catch {
        try {
          const minimalHistory = contractHistory.map((item) => ({ ...item, clean_text: '' }));
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(minimalHistory));
        } catch (e) {
          console.warn('Failed to save contract history to localStorage', e);
        }
      }
    }
  }, [contractHistory]);

  const setBackendUrl = (url: string) => {
    setBackendUrlState(url);
    localStorage.setItem(BACKEND_URL_STORAGE_KEY, url);
  };

  const clearError = () => setError(null);

  // Check health periodically & on mount
  const checkHealth = useCallback(async () => {
    setBackendStatus('checking');
    try {
      await checkBackendHealth(backendUrl);
      setBackendStatus('connected');
    } catch {
      setBackendStatus('offline');
    }
  }, [backendUrl]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const navigateTo = (view: ViewType) => {
    clearError();
    setCurrentView(view);
  };

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (currentJobIdRef.current) {
      cancelAnalysisJob(currentJobIdRef.current, backendUrl);
      currentJobIdRef.current = null;
    }
    setIsAnalyzing(false);
    setProgressPercent(5);
    setError('Analysis was cancelled by user.');
    setCurrentView('upload');
  };

  const startAnalysis = async (file: File) => {
    if (isAnalyzing) return; // Prevent duplicate submission

    setError(null);
    setActiveFile(file);
    setIsAnalyzing(true);
    setProcessingStep(0);
    setProgressPercent(5);
    setProcessingStageText(PROCESSING_STAGES[0]);
    setCurrentView('processing');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const handleStageUpdate = (stage: string, progress?: number) => {
      setProcessingStageText(stage);
      if (typeof progress === 'number' && progress >= 0) {
        setProgressPercent(Math.min(100, Math.max(5, progress)));
      }
      const stageLower = stage.toLowerCase();
      if (stageLower.includes('upload')) {
        setProcessingStep(0);
      } else if (stageLower.includes('extract')) {
        setProcessingStep(1);
      } else if (stageLower.includes('detect') || stageLower.includes('classif')) {
        setProcessingStep(2);
      } else if (stageLower.includes('reason') || stageLower.includes('slm') || stageLower.includes('qwen') || stageLower.includes('ai')) {
        setProcessingStep(3);
      } else if (stageLower.includes('final') || stageLower.includes('synthes')) {
        setProcessingStep(4);
      }
    };

    try {
      const result = await analyzeContract(
        file,
        backendUrl,
        handleStageUpdate,
        (jobId) => {
          currentJobIdRef.current = jobId;
        },
        controller.signal
      );

      setProcessingStep(PROCESSING_STAGES.length - 1);
      setProcessingStageText(PROCESSING_STAGES[PROCESSING_STAGES.length - 1]);
      setProgressPercent(100);

      setActiveContract(result);
      setChatMessages([]);

      // Add to history
      const historyItem: ContractHistoryItem = {
        id: result.file_id || `${Date.now()}`,
        filename: result.filename || file.name,
        contract_type: result.contract_type?.contract_type || 'General Document',
        confidence: result.contract_type?.confidence || 0,
        analyzed_at: result.analyzed_at || new Date().toISOString(),
        file_size: file.size,
        summary: result.summary,
        risk_analysis: result.risk_analysis,
        clean_text: result.clean_text,
        entities: result.entities,
        clauses: result.clauses,
        is_contract: result.is_contract,
        chat_history: [],
      };

      setContractHistory((prev) => [historyItem, ...prev.filter((i) => i.id !== historyItem.id)]);

      // Transition to analysis view
      setTimeout(() => {
        setIsAnalyzing(false);
        abortControllerRef.current = null;
        currentJobIdRef.current = null;
        setCurrentView('analysis');
      }, 500);
    } catch (err: any) {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
      currentJobIdRef.current = null;
      setError(err.message || 'Analysis failed. Please check the backend connection.');
      setCurrentView('upload');
    }
  };

  const askQuestion = async (question: string) => {
    if (!activeContract || !activeContract.clean_text) {
      setError('Please upload or select a document before asking questions.');
      return;
    }

    if (isAsking) return; // Prevent duplicate question submissions

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setIsAsking(true);
    setError(null);

    try {
      const res = await askContractQuestion(
        activeContract.clean_text,
        question,
        backendUrl,
        updatedMessages
      );

      const aiMessage: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        sources: res.retrieved_sections,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMessage]);

      // Update history with new chat message
      if (activeContract.file_id) {
        setContractHistory((prev) =>
          prev.map((item) => {
            if (item.id === activeContract.file_id) {
              return {
                ...item,
                chat_history: [...(item.chat_history || []), userMessage, aiMessage],
              };
            }
            return item;
          })
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to answer question. Please retry.');
      const errorMessage: ChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ An error occurred while generating the answer from the document. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const selectContractFromHistory = (item: ContractHistoryItem) => {
    const result: AnalysisResult = {
      file_id: item.id,
      filename: item.filename,
      contract_type: {
        contract_type: item.contract_type,
        confidence: item.confidence,
      },
      entities: item.entities,
      clauses: item.clauses,
      summary: item.summary,
      risk_analysis: item.risk_analysis,
      clean_text: item.clean_text,
      analyzed_at: item.analyzed_at,
      is_contract: item.is_contract,
    };
    setActiveContract(result);
    setChatMessages(item.chat_history || []);
    setCurrentView('analysis');
  };

  const deleteContract = (id: string) => {
    setContractHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeContract?.file_id === id) {
      setActiveContract(null);
      setChatMessages([]);
    }
  };

  const resetActiveContract = () => {
    setActiveContract(null);
    setActiveFile(null);
    setChatMessages([]);
  };

  return (
    <ContractContext.Provider
      value={{
        currentView,
        navigateTo,
        activeContract,
        activeFile,
        contractHistory,
        backendStatus,
        backendUrl,
        setBackendUrl,
        isAnalyzing,
        processingStep,
        processingStageText,
        progressPercent,
        isAsking,
        chatMessages,
        error,
        clearError,
        startAnalysis,
        cancelAnalysis,
        askQuestion,
        clearChat,
        selectContractFromHistory,
        deleteContract,
        checkHealth,
        resetActiveContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};
