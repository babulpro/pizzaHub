/**
 * PizzaHub Backend API Client
 * Automatically points to https://pizzaserver.vercel.app/api or local backend.
 */

import { authClient } from '@/lib/auth-client';

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

/**
 * Ensures the client has an active backend JWT token.
 * If missing, automatically exchanges the active Better-Auth session for an Express JWT.
 */
export async function ensureApiToken(password?: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  let token = getStoredToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // If token has at least 1 minute remaining before expiry
      if (payload.exp && payload.exp * 1000 > Date.now() + 60000) {
        return token;
      }
    } catch {
      // Invalid format, will refresh below
    }
  }

  try {
    const sessionRes = await authClient.getSession();
    const user = sessionRes?.data?.user as
      | { email?: string; name?: string; role?: string; businessName?: string }
      | undefined;

    if (user?.email) {
      const res = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role || 'customer',
          businessName: user.businessName,
          password: password,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setStoredToken(data.token);
        return data.token;
      }
    }
  } catch (err) {
    console.warn('Could not auto-sync backend JWT token:', err);
  }

  return null;
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
  let token = getStoredToken();
  if (!token && typeof window !== 'undefined') {
    token = await ensureApiToken();
  }

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
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Auto-retry once on 401 if a fresh token can be obtained
    if (response.status === 401 && typeof window !== 'undefined') {
      const freshToken = await ensureApiToken();
      if (freshToken && freshToken !== token) {
        headers.set('Authorization', `Bearer ${freshToken}`);
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

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
