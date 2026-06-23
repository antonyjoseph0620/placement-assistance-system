const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export async function apiFetch(path, options) {
  const url = apiUrl(path);
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error(`[apiFetch] Request failed: ${options?.method || 'GET'} ${url}`, error);
    throw error;
  }
}
