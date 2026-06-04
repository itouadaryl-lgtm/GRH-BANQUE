// src/hooks/useAuth.ts

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, GRH_TOKEN_KEY, GRH_USER_KEY, queryClient } from "../services/api.client";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  roleName?: string;
  agencyId?: string;
  permissions?: string[];
}

export function useAuth() {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (!res.data?.success) throw new Error(res.data?.message || "Échec connexion");
    const { token, expiresAt, user } = res.data.data;
    localStorage.setItem(GRH_TOKEN_KEY, token);
    localStorage.setItem(GRH_USER_KEY, JSON.stringify({ ...user, expiresAt }));
    await queryClient.invalidateQueries();
    navigate("/dashboard", { replace: true });
    return user as AuthUser;
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    localStorage.removeItem(GRH_TOKEN_KEY);
    localStorage.removeItem(GRH_USER_KEY);
    queryClient.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  const getStoredUser = (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(GRH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return { login, logout, getStoredUser };
}
