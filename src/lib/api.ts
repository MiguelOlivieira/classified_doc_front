// frontend/src/lib/api.ts
/// <reference types="vite/client" />
// Pega a URL da nuvem (Vercel) ou usa a porta 3000 localmente (Dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Garante que a URL base termine sem a barra extra (ex: previne onrender.com//api/login)
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
};