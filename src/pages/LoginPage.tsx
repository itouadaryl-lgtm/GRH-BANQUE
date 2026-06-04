// src/pages/LoginPage.tsx

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { GRH_TOKEN_KEY } from "../services/api.client";
import { jwtDecode } from "jwt-decode";

const PatternSvg = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="afg-diamonds" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#afg-diamonds)" />
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const token = localStorage.getItem(GRH_TOKEN_KEY);
  if (token) {
    try {
      const d = jwtDecode<{ exp?: number }>(token);
      if (d.exp && d.exp * 1000 > Date.now()) return <Navigate to="/dashboard" replace />;
    } catch {
      /* continue to login */
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string }; status?: number } }).response?.data
              ?.message ||
            ((err as { response?: { status?: number } }).response?.status === 429
              ? "Trop de tentatives — réessayez dans 1 minute"
              : "Email ou mot de passe incorrect")
          : "Email ou mot de passe incorrect";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotMsg("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotMsg("Si l'email existe, un lien de réinitialisation a été envoyé.");
    } catch {
      setForgotMsg("Erreur réseau. Réessayez.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row font-['Source_Sans_3',sans-serif]"
      style={{ background: "#07080D", color: "#F0EDE6" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Colonne gauche — branding */}
      <div
        className="relative hidden lg:flex lg:w-[60%] items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #07080D 0%, #0F1117 50%, #07080D 100%)" }}
      >
        <PatternSvg />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 text-center px-12 max-w-xl">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 border"
            style={{ borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)" }}
          >
            <span className="text-3xl font-bold font-['Playfair_Display',serif]" style={{ color: "#C9A84C" }}>
              AFG
            </span>
          </div>
          <h1
            className="text-4xl xl:text-5xl font-['Playfair_Display',serif] font-semibold leading-tight mb-4"
            style={{ color: "#F0EDE6" }}
          >
            AFG Bank Gabon
            <br />
            <span style={{ color: "#C9A84C" }}>Archives RH</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#6B6B7A" }}>
            Gestion Électronique des Documents RH — Sécurisée, conforme COBAC, multi-agences.
          </p>
          <p
            className="mt-8 text-xs font-['JetBrains_Mono',monospace] tracking-widest uppercase"
            style={{ color: "rgba(201,168,76,0.5)" }}
          >
            Système Central d&apos;Archives &amp; Accréditations
          </p>
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0"
        style={{ background: "#0F1117" }}
      >
        <div
          className={`w-full max-w-md transition-all duration-[600ms] ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div
            className="rounded-2xl p-8 sm:p-10 border shadow-2xl"
            style={{
              background: "#0F1117",
              borderColor: "rgba(201,168,76,0.18)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="lg:hidden mb-8 text-center">
              <span className="text-2xl font-['Playfair_Display',serif] font-bold" style={{ color: "#C9A84C" }}>
                AFG Bank
              </span>
              <p className="text-sm mt-1" style={{ color: "#6B6B7A" }}>
                Archives RH
              </p>
            </div>

            <h2
              className="text-2xl font-['Playfair_Display',serif] font-semibold mb-1"
              style={{ color: "#F0EDE6" }}
            >
              Connexion
            </h2>
            <p className="text-sm mb-8" style={{ color: "#6B6B7A" }}>
              Accédez à votre espace sécurisé
            </p>

            {error && (
              <div
                className="mb-6 flex items-start gap-3 p-4 rounded-xl text-sm animate-in slide-in-from-top-2"
                style={{ background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.3)", color: "#E05252" }}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-['JetBrains_Mono',monospace] uppercase tracking-wider mb-2" style={{ color: "#6B6B7A" }}>
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#6B6B7A" }} />
                  <input
                    type="email"
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aime.mbili@afgbank.ga"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                    style={{
                      background: "#07080D",
                      border: "1px solid rgba(201,168,76,0.18)",
                      color: "#F0EDE6",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-['JetBrains_Mono',monospace] uppercase tracking-wider mb-2" style={{ color: "#6B6B7A" }}>
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#6B6B7A" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                    style={{
                      background: "#07080D",
                      border: "1px solid rgba(201,168,76,0.18)",
                      color: "#F0EDE6",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: "#6B6B7A" }}
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: loading ? "#A8893E" : "linear-gradient(135deg, #C9A84C 0%, #A8893E 100%)",
                  color: "#07080D",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #E8C97A 0%, #C9A84C 100%)";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #C9A84C 0%, #A8893E 100%)";
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authentification…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="mt-6 text-sm w-full text-center hover:underline"
              style={{ color: "#C9A84C" }}
            >
              Mot de passe oublié ?
            </button>

            <p className="mt-8 text-center text-[10px] font-['JetBrains_Mono',monospace]" style={{ color: "#6B6B7A" }}>
              Démo : aime.mbili@afgbank.ga / 123
            </p>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(7,8,13,0.85)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 border" style={{ background: "#0F1117", borderColor: "rgba(201,168,76,0.18)" }}>
            <h3 className="text-lg font-['Playfair_Display',serif] mb-4" style={{ color: "#F0EDE6" }}>
              Réinitialiser le mot de passe
            </h3>
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Votre email professionnel"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: "#07080D", border: "1px solid rgba(201,168,76,0.18)", color: "#F0EDE6" }}
              />
              {forgotMsg && <p className="text-sm" style={{ color: "#C9A84C" }}>{forgotMsg}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="flex-1 py-2 rounded-xl text-sm border"
                  style={{ borderColor: "rgba(201,168,76,0.18)", color: "#6B6B7A" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "#C9A84C", color: "#07080D" }}
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
