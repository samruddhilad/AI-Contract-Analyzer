import { Platform } from 'react-native';
import { API_BASE_URL } from '../config';
import type { AnalysisResult, AskQuestionResponse } from '../types/contract';

export async function checkBackendHealth(baseUrl: string = API_BASE_URL): Promise<boolean> {
  const url = `${baseUrl.replace(/\/$/, '')}/`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (__DEV__) {
      console.log(`[HealthCheck] GET ${url} -> status: ${res.status}, ok: ${res.ok}`);
    }
    return res.ok;
  } catch (err: any) {
    if (__DEV__) {
      console.warn(`[HealthCheck] GET ${url} failed:`, err?.message || err);
    }
    return false;
  }
}

export async function analyzeContract(
  asset: { uri: string; name: string; mimeType?: string; size?: number; file?: any },
  baseUrl: string = API_BASE_URL
): Promise<AnalysisResult> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/analyze`;
  const mimeType = asset.mimeType || 'application/octet-stream';

  // 6. Console logging before sending
  console.log('[ContractApi] FormData upload start');
  console.log('[ContractApi] Upload parameters:', {
    filename: asset.name,
    mimeType: mimeType,
    apiUrl: url,
    platform: Platform.OS,
  });

  // 1. The frontend MUST use FormData
  const formData = new FormData();

  // 4 & 5. Field must be exactly "file", handling Web vs Mobile file objects
  if (Platform.OS === 'web') {
    // In React Native Web / Browser environment:
    // Append standard DOM File or Blob to ensure a valid multipart file part with filename is generated
    if (asset.file && (asset.file instanceof File || asset.file instanceof Blob)) {
      formData.append('file', asset.file, asset.name);
    } else if (asset.uri && (asset.uri.startsWith('blob:') || asset.uri.startsWith('data:'))) {
      const blobResponse = await fetch(asset.uri);
      const blob = await blobResponse.blob();
      formData.append('file', blob, asset.name);
    } else {
      // Fallback for web
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: mimeType,
      } as any);
    }
  } else {
    // In Native Mobile (Android / iOS):
    // React Native's native FormData handler requires { uri, name, type }
    formData.append('file', {
      uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
      name: asset.name,
      type: mimeType,
    } as any);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout for SLM inference

  try {
    // 2. Send: fetch(`${API_BASE_URL}/api/analyze`, { method: "POST", body: formData })
    // 3. DO NOT manually set Content-Type. Let fetch/browser/React Native set multipart boundary automatically.
    const uploadUrl = `${baseUrl.replace(/\/$/, '')}/api/analyze?async_mode=true`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
      throw new Error(`[${response.status}] ${formattedError}`);
    }

    if (data.job_id) {
      const jobId = data.job_id;
      const statusUrl = `${baseUrl.replace(/\/$/, '')}/api/jobs/${jobId}`;
      const pollStart = Date.now();
      while (Date.now() - pollStart < 300000) {
        await new Promise((res) => setTimeout(res, 1500));
        const pollRes = await fetch(statusUrl);
        if (!pollRes.ok) continue;
        const jobData = await pollRes.json();
        if (jobData.status === 'completed' && jobData.result) {
          return {
            ...jobData.result,
            filename: jobData.result.filename || asset.name,
            analyzed_at: new Date().toISOString(),
          };
        }
        if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Analysis job failed on server.');
        }
      }
      throw new Error('Analysis job timed out on server.');
    }

    return {
      ...data,
      filename: data.filename || asset.name,
      analyzed_at: new Date().toISOString(),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Analysis request timed out. The SLM is taking longer to process.');
    }
    throw err;
  }
}

export async function askContractQuestion(
  contractText: string,
  question: string,
  baseUrl: string = API_BASE_URL
): Promise<AskQuestionResponse> {
  if (!contractText) {
    throw new Error('No contract text available.');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/ask`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contract_text: contractText,
        question: question.trim(),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `Question failed with status ${response.status}`);
    }

    return {
      question: data.question || question,
      answer: data.answer || 'No answer generated.',
      retrieved_sections: Array.isArray(data.retrieved_sections) ? data.retrieved_sections : [],
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Question request timed out.');
    }
    throw new Error(err.message || 'Could not answer the question.');
  }
}
