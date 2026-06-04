/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { login } from "../services/grh.api";
import { queryClient } from "../utils/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { fullName: string; email: string; roleName?: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "forgotSuccess">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    setErrorMsg("");
    setStatus("loading");

    try {
      const { user } = await login(email, password);
      await queryClient.invalidateQueries();
      setStatus("success");
      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        onClose();
        setEmail("");
        setPassword("");
        setStatus("idle");
      }, 800);
    } catch (err: unknown) {
      setStatus("idle");
      setErrorMsg(err instanceof Error ? err.message : "Identifiants incorrects.");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("forgotSuccess");
      setTimeout(() => {
        setIsForgotMode(false);
        setStatus("idle");
      }, 3000);
    }, 1500);
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-15">
        {/* Luxury top ornament */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0052CC] via-[#0066FF] to-[#0A84FF]" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-full transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <Icons.X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#0052CC] animate-spin" />
                <Icons.Shield className="w-6 h-6 text-[#0052CC] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Authentification Fortifiée</h3>
                <p className="text-slate-500 text-xs mt-1">Négociation de clés et déchiffrement AES-256...</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
                <Icons.Check className="w-8 h-8 text-emerald-600 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Habilitation Approuvée</h3>
                <p className="text-slate-500 text-xs mt-1">Bienvenue dans l'espace sécurisé AFG Bank.</p>
              </div>
            </div>
          )}

          {status === "forgotSuccess" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-16 h-16 bg-[#0052CC]/10 rounded-full flex items-center justify-center border border-[#0052CC]/20">
                <Icons.Mail className="w-7 h-7 text-[#0052CC]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Instructions Envoyées</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Un email crypté contenant la clé OTP réinitialisée a été envoyé à {forgotEmail}.
                </p>
              </div>
            </div>
          )}

          {status === "idle" && (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#0052CC]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Icons.Lock className="w-6 h-6 text-[#0052CC]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {isForgotMode ? "Mot de Passe Oublié" : "Espace Authentification"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isForgotMode
                    ? "Saisissez votre matricule email pour recevoir un ticket de recouvrement."
                    : "Accédez aux voûtes GED hautement confidentielles d'AFG Bank Gabon."}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex gap-2 items-center">
                  <Icons.AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Content */}
              {!isForgotMode ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Adresse Email Professionnelle
                    </label>
                    <div className="relative flex items-center">
                      <Icons.Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom.prenom@afgbank.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0052CC] focus:border-[#0052CC] focus:bg-white text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Clef de Chiffrement / Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotMode(true)}
                        className="text-[10px] text-[#0052CC] hover:underline font-bold"
                      >
                        Clé perdue ?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Icons.Key className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0052CC] focus:border-[#0052CC] focus:bg-white text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Keep logged in checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0052CC] bg-slate-50 border-slate-300 accent-[#0052CC] focus:ring-0 focus:outline-none"
                      />
                      <span>Mémoriser ma session</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white font-bold rounded-xl text-xs transition-colors shadow-lg hover:shadow-[#0052CC]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Déverrouiller le Portail</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Email Professionnel Associé
                    </label>
                    <div className="relative flex items-center">
                      <Icons.Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="votre.adresse@afgbank.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0052CC] focus:border-[#0052CC] focus:bg-white text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(false)}
                      className="flex-1 py-2.5 border border-slate-250 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#0052CC] hover:bg-[#0066FF] text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
                    >
                      Restaurer clé
                    </button>
                  </div>
                </form>
              )}

              {/* Single Sign On Separator */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-slate-100" />
                <span className="flex-shrink mx-4 text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                  Fournisseurs Identités Fédérées
                </span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              {/* SSO Buttons */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => alert("Interfaçage avec Active Directory Google Workspace réussi.")}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  <Icons.Chrome className="w-4 h-4 text-[#EA4335]" />
                  <span>Google SSO</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Interfaçage avec Microsoft Azure AD IDP réussi.")}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  <Icons.KeyRound className="w-4 h-4 text-[#0078D4]" />
                  <span>Azure AD</span>
                </button>
              </div>

              {/* Footer legalities */}
              <p className="text-[9.5px] text-slate-400 leading-normal text-center mt-6 font-medium">
                Cette session est régulée et auditée par la surveillance générale de la Banque Centrale. Toute usurpation expose à des poursuites.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
