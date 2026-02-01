/**
 * API Configuration Constants
 *
 * In development, Vite proxies /api requests to localhost:3001
 * In production, API_BASE should be set via environment variable
 */

export const API_BASE = import.meta.env.VITE_API_BASE || '';
