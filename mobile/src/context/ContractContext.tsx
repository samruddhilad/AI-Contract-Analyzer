import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import type {
  AnalysisResult,
  ContractHistoryItem,
} from '../types/contract';
import {
  analyzeContract,
  askContractQuestion,
  checkBackendHealth,
} from '../api/contractApi';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';

export type MobileTab = 'home' | 'upload' | 'contracts' | 'ask_ai' | 'settings';

export interface MobileChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  timestamp: string;
}

interface MobileContractContextType {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  activeContract: AnalysisResult | null;
  contractHistory: ContractHistoryItem[];
  chatMessages: MobileChatMessage[];
  isAnalyzing: boolean;
  isAsking: boolean;
  backendConnected: boolean;
  isHealthChecked: boolean;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  analyzeDocument: (asset: { uri: string; name: string; mimeType?: string; size?: number }) => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  clearChat: () => void;
  selectContract: (item: ContractHistoryItem) => void;
  deleteContract: (id: string) => void;
  checkHealth: () => Promise<void>;
}

const MobileContractContext = createContext<MobileContractContextType | undefined>(undefined);

export const MobileContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [activeContract, setActiveContract] = useState<AnalysisResult | null>(null);
  const [contractHistory, setContractHistory] = useState<ContractHistoryItem[]>([]);
  const [chatMessages, setChatMessages] = useState<MobileChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isHealthChecked, setIsHealthChecked] = useState(false);
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL);

  const colors = theme === 'dark' ? darkColors : lightColors;

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const checkHealth = useCallback(async () => {
    const isOk = await checkBackendHealth(backendUrl);
    setBackendConnected(isOk);
    setIsHealthChecked(true);
  }, [backendUrl]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth, activeTab]);

  const analyzeDocument = async (asset: {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  }) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeContract(asset, backendUrl);
      setActiveContract(result);
      setChatMessages([]);

      const historyItem: ContractHistoryItem = {
        id: result.file_id || `${Date.now()}`,
        filename: result.filename || asset.name,
        contract_type: result.contract_type?.contract_type || 'General Contract',
        confidence: result.contract_type?.confidence || 0,
        analyzed_at: result.analyzed_at || new Date().toISOString(),
        file_size: asset.size,
        summary: result.summary,
        risk_analysis: result.risk_analysis,
        clean_text: result.clean_text,
        entities: result.entities,
        clauses: result.clauses,
        chat_history: [],
      };

      setContractHistory((prev) => [historyItem, ...prev.filter((i) => i.id !== historyItem.id)]);
      setActiveTab('contracts'); // Or go to analysis
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askQuestion = async (question: string) => {
    if (!activeContract || !activeContract.clean_text || !question.trim()) return;

    const userMsg: MobileChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);

    try {
      const res = await askContractQuestion(activeContract.clean_text, question.trim(), backendUrl);
      const aiMsg: MobileChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        sources: res.retrieved_sections,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: MobileChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error: ${err.message || 'Could not query contract'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const selectContract = (item: ContractHistoryItem) => {
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
    };
    setActiveContract(result);
    setChatMessages(item.chat_history || []);
  };

  const deleteContract = (id: string) => {
    setContractHistory((prev) => prev.filter((i) => i.id !== id));
    if (activeContract?.file_id === id) {
      setActiveContract(null);
      setChatMessages([]);
    }
  };

  return (
    <MobileContractContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        activeTab,
        setActiveTab,
        activeContract,
        contractHistory,
        chatMessages,
        isAnalyzing,
        isAsking,
        backendConnected,
        backendUrl,
        setBackendUrl,
        analyzeDocument,
        askQuestion,
        clearChat,
        selectContract,
        deleteContract,
        checkHealth,
      }}
    >
      {children}
    </MobileContractContext.Provider>
  );
};

export const useMobileContract = (): MobileContractContextType => {
  const ctx = useContext(MobileContractContext);
  if (!ctx) throw new Error('useMobileContract must be used within MobileContractProvider');
  return ctx;
};
