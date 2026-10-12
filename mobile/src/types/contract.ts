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
  [key: string]: string[] | undefined;
}

export interface ClauseItem {
  detected: boolean;
  text?: string;
  confidence?: number;
}

export type ClauseMap = Record<string, boolean | ClauseItem | string>;

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
}

export interface AskQuestionRequest {
  contract_text: string;
  question: string;
}

export interface AskQuestionResponse {
  question: string;
  answer: string;
  retrieved_sections: string[];
}

export interface ContractHistoryItem {
  id: string;
  filename: string;
  contract_type: string;
  confidence: number;
  analyzed_at: string;
  summary: string;
  risk_analysis: string;
  clean_text: string;
  entities: EntityMap;
  clauses: ClauseMap;
  chat_history?: {
    id: string;
    sender: "user" | "ai";
    text: string;
    sources?: string[];
    timestamp: string;
  }[];
}
