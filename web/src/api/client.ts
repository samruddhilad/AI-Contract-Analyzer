export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const DEFAULT_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export const DEFAULT_TIMEOUT_MS = 120000; // 120s fallback

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortListener = () => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      throw new ApiError('Request was cancelled.', 499);
    }
    externalSignal.addEventListener('abort', abortListener);
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', abortListener);
    }
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', abortListener);
    }

    if (externalSignal?.aborted) {
      throw new ApiError('Request was cancelled.', 499);
    }

    if (err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The AI model is taking longer to process. Please retry.',
        408
      );
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new ApiError(
        'Backend server is unavailable or offline. Please check if FastAPI is running on http://127.0.0.1:8000.',
        503
      );
    }
    throw new ApiError(err.message || 'Network request failed', 500);
  }
}
