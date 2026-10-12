import { fetchWithTimeout, ApiError, DEFAULT_BASE_URL } from './client';
import type { AnalysisResult, AskQuestionResponse, ChatMessageItem } from '../types/contract';

export interface BackendHealthResponse {
  message: string;
  docs?: string;
  status: 'ok' | 'ready';
}

const VALID_EXTENSIONS = [
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

/**
 * Checks the status of the FastAPI backend (GET /).
 */
export async function checkBackendHealth(
  baseUrl: string = DEFAULT_BASE_URL
): Promise<BackendHealthResponse> {
  const url = `${baseUrl.replace(/\/$/, '')}/`;
  const response = await fetchWithTimeout(url, { method: 'GET' }, 8000);

  if (!response.ok) {
    throw new ApiError(`Health check failed with status: ${response.status}`, response.status);
  }

  const data = await response.json();
  return {
    message: data.message || 'API is active',
    docs: data.docs,
    status: 'ok',
  };
}

/**
 * Cancels an ongoing analysis job on the backend.
 */
export async function cancelAnalysisJob(
  jobId: string,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<void> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/jobs/${jobId}/cancel`;
  try {
    await fetchWithTimeout(url, { method: 'POST' }, 8000);
  } catch (err) {
    console.warn(`[ContractApi] Error cancelling job ${jobId}:`, err);
  }
}

/**
 * Uploads a document to POST /api/analyze?async_mode=true and polls the job status.
 * Supported formats: .pdf, .docx, .txt, .csv, .xlsx, .pptx, .md, .html, .htm
 */
export async function analyzeContract(
  file: File,
  baseUrl: string = DEFAULT_BASE_URL,
  onStageUpdate?: (stage: string, progress?: number) => void,
  onJobCreated?: (jobId: string) => void,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!VALID_EXTENSIONS.includes(ext)) {
    throw new ApiError(
      `Unsupported file type: "${ext}". Please upload a PDF, DOCX, TXT, CSV, XLSX, PPTX, MD, or HTML document.`,
      400
    );
  }

  if (file.size === 0) {
    throw new ApiError('The selected file is empty (0 bytes). Please choose a valid file.', 400);
  }

  const uploadUrl = `${baseUrl.replace(/\/$/, '')}/api/analyze?async_mode=true`;

  const formData = new FormData();
  formData.append('file', file);

  onStageUpdate?.('Uploading document to server...', 10);

  // 1. Initial upload request (typically completes in < 2 seconds)
  const response = await fetchWithTimeout(
    uploadUrl,
    {
      method: 'POST',
      body: formData,
    },
    30000,
    signal
  );

  const responseText = await response.text();
  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = { detail: responseText };
  }

  if (!response.ok) {
    let formattedError = `Analysis failed with status ${response.status}`;
    if (data && data.detail) {
      if (typeof data.detail === 'string') {
        formattedError = data.detail;
      } else if (Array.isArray(data.detail)) {
        formattedError = data.detail
          .map((item: any) => `${item.loc?.join('.') || 'field'}: ${item.msg}`)
          .join('; ');
      } else {
        formattedError = JSON.stringify(data.detail);
      }
    }
    throw new ApiError(formattedError, response.status, data);
  }

  // If server processed synchronously (cache hit or direct response)
  if (!data.job_id && data.summary) {
    return {
      ...data,
      filename: data.filename || file.name,
      analyzed_at: new Date().toISOString(),
    } as AnalysisResult;
  }

  // 2. Async Job Polling Flow
  const jobId = data.job_id;
  if (!jobId) {
    throw new ApiError('Server did not return a valid analysis job ID.', 500);
  }

  onJobCreated?.(jobId);
  onStageUpdate?.(data.stage || 'Extracting document text...', data.progress || 15);

  const statusUrl = `${baseUrl.replace(/\/$/, '')}/api/jobs/${jobId}`;
  const maxPollTimeMs = 300000; // 5 minutes max
  const pollIntervalMs = 1200; // poll every 1.2s
  const startTime = Date.now();

  while (Date.now() - startTime < maxPollTimeMs) {
    if (signal?.aborted) {
      await cancelAnalysisJob(jobId, baseUrl);
      throw new ApiError('Analysis was cancelled by user.', 499);
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    try {
      const pollRes = await fetchWithTimeout(statusUrl, { method: 'GET' }, 10000, signal);
      if (!pollRes.ok) {
        continue;
      }

      const jobData = await pollRes.json();

      if (jobData.status === 'completed' && jobData.result) {
        return {
          ...jobData.result,
          filename: jobData.result.filename || file.name,
          analyzed_at: new Date().toISOString(),
        } as AnalysisResult;
      }

      if (jobData.status === 'failed') {
        throw new ApiError(jobData.error || 'Document analysis encountered an error.', 500);
      }

      if (jobData.status === 'cancelled') {
        throw new ApiError('Analysis job was cancelled.', 499);
      }

      // Still in progress
      onStageUpdate?.(jobData.stage || 'Processing document...', jobData.progress || 50);
    } catch (pollErr: any) {
      if (pollErr.status === 499 || signal?.aborted) {
        await cancelAnalysisJob(jobId, baseUrl);
        throw new ApiError('Analysis was cancelled by user.', 499);
      }
      if (pollErr instanceof ApiError && pollErr.status === 500) {
        throw pollErr;
      }
      // Transient network hiccup during poll, continue loop
    }
  }

  throw new ApiError(
    'Analysis timed out while processing on the server. Please retry with a shorter document.',
    408
  );
}

/**
 * Asks a grounded question about the contract (POST /api/ask).
 * Uses extracted clean_text, conversation history, and the user's question.
 */
export async function askContractQuestion(
  contractText: string,
  question: string,
  baseUrl: string = DEFAULT_BASE_URL,
  conversationHistory?: ChatMessageItem[]
): Promise<AskQuestionResponse> {
  if (!contractText || !contractText.trim()) {
    throw new ApiError('No document text available. Please upload a document first.', 400);
  }

  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    throw new ApiError('Please enter a valid question.', 400);
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/ask`;

  const payload: any = {
    contract_text: contractText,
    question: trimmedQuestion,
  };

  if (conversationHistory && conversationHistory.length > 0) {
    payload.conversation_history = conversationHistory.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));
  }

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    90000 // 90s max for Ask AI on CPU
  );

  const responseText = await response.text();
  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new ApiError('Received invalid JSON response from server.', 500);
  }

  if (!response.ok) {
    throw new ApiError(
      data.detail || `Question query failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return {
    question: data.question || trimmedQuestion,
    answer: data.answer || 'No answer generated.',
    retrieved_sections: Array.isArray(data.retrieved_sections) ? data.retrieved_sections : [],
  };
}
