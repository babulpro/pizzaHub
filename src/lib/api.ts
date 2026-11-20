/**
 * PizzaHub Backend API Client
 * Automatically points to https://pizzaserver.vercel.app/api or local backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://pizzaserver.vercel.app/api';

const TOKEN_KEY = 'pizzahub_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: unknown;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        ...data,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : 'Network error: could not connect to PizzaHub server.';
    return {
      success: false,
      message: msg,
    };
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, { method: 'GET', headers }),

  post: <T = unknown>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  delete: <T = unknown>(endpoint: string, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, { method: 'DELETE', headers }),
};
