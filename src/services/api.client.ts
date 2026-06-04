// src/services/api.client.ts

import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export const GRH_TOKEN_KEY = "grh_token";
export const GRH_USER_KEY = "grh_user";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

export const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(GRH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      localStorage.removeItem(GRH_TOKEN_KEY);
      localStorage.removeItem(GRH_USER_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function apiGet<T>(url: string, voirTout = false): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { headers: getAuthHeaders(voirTout) });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Erreur API");
  }
  return res.data.data as T;
}

export async function apiMutate<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  payload?: unknown,
  voirTout = false
): Promise<ApiResponse<T>> {
  const config = { headers: getAuthHeaders(voirTout) };
  const res =
    method === "POST"
      ? await api.post<ApiResponse<T>>(url, payload, config)
      : method === "PUT"
        ? await api.put<ApiResponse<T>>(url, payload, config)
        : method === "PATCH"
          ? await api.patch<ApiResponse<T>>(url, payload, config)
          : await api.delete<ApiResponse<T>>(url, config);
  return res.data;
}

export function getAuthHeaders(voirToutActive = false): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Voir-Tout": voirToutActive ? "true" : "false",
  };
  const token = localStorage.getItem(GRH_TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
