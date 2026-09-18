// frontend/src/lib/api.ts
/// <reference types="vite/client" />
// frontend/src/lib/api.ts

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Só adiciona Content-Type: application/json se houver um corpo na requisição
  // e o Content-Type já não tiver sido explicitamente definido
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};