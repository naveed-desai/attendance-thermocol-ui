/**
 * Centralized environment configuration for the frontend application.
 * All environment variables must be imported and accessed strictly through this file.
 */

const rawBackendUrl: string =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'http://localhost:3000';

const cleanBackendUrl = rawBackendUrl.replace(/\/+$/, '');
const apiBaseUrl = cleanBackendUrl.endsWith('/api')
  ? cleanBackendUrl
  : `${cleanBackendUrl}/api`;

export const envConfig = {
  BACKEND_URL: cleanBackendUrl,
  API_BASE_URL: apiBaseUrl,
  MODE: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export const { BACKEND_URL, API_BASE_URL } = envConfig;

export default envConfig;
