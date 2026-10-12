export interface ContractTypeResult {
  contract_type: string;
  confidence: number;
}

export interface EntityMap {
  parties?: string[];
  dates?: string[];
  money?: string[];
  durations?: string[];
  emails?: string[];
  phones?: string[];
  properties?: string[];
  [key: string]: string[] | undefined;
}

export interface ClauseItem {
  detected: boolean;
  text?: string;
  confidence?: number;
  matched_terms?: string[];
}

export type ClauseMap = Record<string, boolean | ClauseItem | string | any>;

export interface AnalysisMetrics {
  extract_sec?: number;
  nlp_sec?: number;
  inference_sec?: number;
  total_sec?: number;
}

export interface AnalysisResult {
  file_id?: string;
  filename?: string;
  contract_type: ContractTypeResult;
  entities: EntityMap;
  clauses: ClauseMap;
  chunk_count?: number;
  summary: string;
  risk_analysis: string;
  clean_text: string;
  analyzed_at?: string;
  is_contract?: boolean;
  category?: string;
  document_overview?: string;
  executive_summary?: string;
  key_points?: string;
  important_details?: string;
  document_specific_analysis?: string;
  source_references?: string[];
  limitations?: string;
  metrics?: AnalysisMetrics;
}

export interface AskQuestionRequest {
  contract_text: string;
  question: string;
  conversation_history?: Array<{ sender: string; text: string }>;
  file_id?: string;
}

export interface AskQuestionResponse {
  question: string;
  answer: string;
  retrieved_sections: string[];
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  timestamp: string;
}

export interface ContractHistoryItem {
  id: string;
  filename: string;
  contract_type: string;
  confidence: number;
  analyzed_at: string;
  file_size?: number;
  summary: string;
  risk_analysis: string;
  clean_text: string;
  entities: EntityMap;
  clauses: ClauseMap;
  is_contract?: boolean;
  chat_history?: ChatMessageItem[];
}

export type BackendConnectionStatus = 'connected' | 'checking' | 'offline';

export type ViewType =
  | 'home'
  | 'dashboard'
  | 'upload'
  | 'processing'
  | 'analysis'
  | 'ask_ai'
  | 'my_contracts'
  | 'settings';
