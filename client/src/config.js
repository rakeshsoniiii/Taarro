// Central config - reads from environment variables set in Vercel dashboard
// For local dev, falls back to localhost:5000

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export const API_BASE = API_BASE_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;
