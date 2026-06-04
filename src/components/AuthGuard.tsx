// src/components/AuthGuard.tsx

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GRH_TOKEN_KEY } from "../services/api.client";
import { api } from "../services/api.client";

interface JwtExp {
  exp?: number;
}

function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtExp>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(GRH_TOKEN_KEY);
    if (!token || !isTokenValid(token)) {
      setValid(false);
      setChecking(false);
      return;
    }

    setValid(true);
    setChecking(false);

    try {
      const decoded = jwtDecode<JwtExp>(token);
      if (decoded.exp) {
        const msUntilExp = decoded.exp * 1000 - Date.now();
        const refreshIn = msUntilExp - 5 * 60_000;
        if (refreshIn > 0) {
          const timer = setTimeout(async () => {
            try {
              const res = await api.post("/api/auth/refresh", null, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.data?.success && res.data.data?.token) {
                localStorage.setItem(GRH_TOKEN_KEY, res.data.data.token);
              }
            } catch {
              /* silent */
            }
          }, refreshIn);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#07080D] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!valid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
