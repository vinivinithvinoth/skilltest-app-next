"use client";

import axios, { AxiosError, type AxiosInstance } from "axios";
import { getSession, signOut } from "next-auth/react";

let inMemoryToken: string | null = null;
let sessionTokenPromise: Promise<string | null> | null = null;

export function setAxiosAuthToken(token: string) {
    inMemoryToken = token;
}

export function clearAxiosAuthToken() {
    inMemoryToken = null;
}

async function getToken(): Promise<string | null> {
    if (inMemoryToken) return inMemoryToken;

    // NextAuth session support (if you expose an accessToken via callbacks).
    // Cached promise avoids calling getSession() repeatedly during bursty requests.
    if (!sessionTokenPromise) {
        sessionTokenPromise = getSession()
            .then((session) => {
                const anySession = session as unknown as { accessToken?: string } | null;
                return anySession?.accessToken ?? null;
            })
            .catch(() => null)
            .finally(() => {
                // Reset so next request can re-check (token might change after sign-in/out).
                sessionTokenPromise = null;
            });
    }
    const sessionToken = await sessionTokenPromise;
    if (sessionToken) return sessionToken;

    if (typeof window === "undefined") return null;
    // Optional: if you store tokens in localStorage for non-NextAuth APIs
    return window.localStorage.getItem("accessToken");
}

function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers ?? {};
      // If your backend expects a different header, change this.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Minimal global handling; keep it safe for server + client.
      const status = error.response?.status;
      if (status === 401 && typeof window !== "undefined") {
        // If NextAuth session is invalid/expired, sign out to clear cookies cleanly.
        signOut({ callbackUrl: "/home" }).catch(() => {
          window.location.href = "/home";
        });
      }
      return Promise.reject(error);
    },
  );
}

// Use this for calling your Next.js route handlers (same-origin).
// Important: keeping baseURL empty ensures `/api/...` hits localhost and
// allows local OTP verification/session setup to work reliably.
export const apiClient: AxiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
attachInterceptors(apiClient);

// Use this only when you intentionally want to call the backend directly.
export const backendClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
attachInterceptors(backendClient);


