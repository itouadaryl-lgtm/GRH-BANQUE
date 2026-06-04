/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { SystemParameter } from "../types";

interface ParametersViewProps {
  parameters: SystemParameter[];
  onSaveParameter: (key: string, value: string) => void;
}

export default function ParametersView({ parameters, onSaveParameter }: ParametersViewProps) {
  const [activeSubTab, setActiveSubTab] = useState("general");
  const [isEditingName, setIsEditingName] = useState(false);
  const [institutionName, setInstitutionName] = useState("AFG BANK GABON");
  const [isResetting, setIsResetting] = useState(false);

  // Get parameters values helper
  const getParamVal = (key: string) => parameters.find(p => p.paramKey === key)?.paramValue || "";

  const handleSaveName = () => {
    onSaveParameter("INSTITUTION_NAME", institutionName);
    setIsEditingName(false);
    alert("Nom de l'institution enregistré avec succès sur le serveur central d'AFG Bank !");
  };

  const handleSystemReset = async () => {
    const confirmReset = window.confirm(
      "CONFIRMATION CRITIQUE - PURGE ENTIÈRE À ZÉRO (0000)\n\nCette action va détruire l'intégralité des dossiers, archives, fiches de paie, contrats de travail, badges professionnels de sécurité générés et registres d'activités.\n\nToutes les statistiques du système seront réinitialisées à ZÉRO.\n\nÊtes-vous absolument sûr de vouloir vider la base de données et de réinitialiser l'application ?"
    );
    if (!confirmReset) return;

    setIsResetting(true);
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.success) {
        alert("L'application a été réinitialisée à zéro (0000) de manière irrévocable !");
        window.location.reload();
      } else {
        alert("Une erreur est survenue : " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de liaison réseau avec le serveur de l'application.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12 font-sans text-xs font-semibold">
      
      {/* Title block */}
      <div className="pb-4 border-b border-slate-150">
        <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Paramétrage Général</p>
        <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2">Configuration <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Système</span></h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Configurez l'identité de l'institution, le fuseau horaire d'archivage, la sécurité globale d'AFG Bank et surveillez l'état des dépendances systèmes.
        </p>
      </div>

      {/* Visual Subtabs Menu bar */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-400">
        {[
          { id: "general", label: "Général" },
          { id: "security", label: "Sécurité d'Accès" },
          { id: "storage", label: "Politiques GED" },
          { id: "notifications", label: "Configuration d'Alertes" }
        ].map(subTab => (
          <button
            key={subTab.id}
            onClick={() => setActiveSubTab(subTab.id)}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === subTab.id ? "border-[#0052CC] text-[#0052CC] font-bold" : "border-transparent hover:text-slate-800"
            }`}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left configurations panels columns */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeSubTab === "general" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 text-xs font-medium shadow-sm">
              
              {/* Institution Name Entry */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 font-mono tracking-widest uppercase text-[10px] font-extrabold">Nom de l'Institution *</label>
                  <button
                    onClick={() => {
                      if (isEditingName) {
                        handleSaveName();
                      } else {
                        setIsEditingName(true);
                      }
                    }}
                    className="flex items-center gap-1 text-[#0052CC] hover:text-[#0066FF] font-bold cursor-pointer text-[11px]"
                  >
                    <Icons.FileEdit className="w-3.5 h-3.5" />
                    {isEditingName ? "Sauvegarder" : "Modifier"}
                  </button>
                </div>
                {isEditingName ? (
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#0052CC]"
                  />
                ) : (
                  <div className="w-full bg-slate-50/50 px-4 py-3 border border-slate-100 rounded-xl text-slate-800/90 font-black text-sm">
                    {getParamVal("INSTITUTION_NAME") || "AFG BANK GABON"}
                  </div>
                )}
              </div>

              {/* Institution brand Logo display */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-mono tracking-widest uppercase text-[10px] font-extrabold">Logo Institutionnel Actif</label>
                <div className="border border-slate-100 rounded-2xl p-4 max-w-xs flex items-center gap-4 bg-slate-50/30">
                  <div className="w-12 h-12 bg-[#0052CC]/10 border border-[#0052CC]/15 rounded-xl flex items-center justify-center font-black text-[#0052CC] text-md shrink-0 shadow-inner">
                    AFG
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0052CC] text-xs font-mono">AFG BANK</h4>
                    <span className="text-[10px] text-slate-400 font-bold">Périmètre National Gabon</span>
                  </div>
                </div>
              </div>

              {/* GMT timezone configuration dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <label className="block text-slate-400 font-mono tracking-widest uppercase text-[10px] font-extrabold mb-2 font-bold">Fuseau horaire *</label>
                  <select
                    value={getParamVal("SYSTEM_TIMEZONE")}
                    onChange={(e) => onSaveParameter("SYSTEM_TIMEZONE", e.target.value)}
                    className="w-full bg-slate-50 p-3 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="Africa/Libreville (WAT)">Libreville ATM - WAT (UTC+1)</option>
                    <option value="Europe/Paris (CET)">Paris - CET (UTC+1)</option>
                    <option value="Africa/Douala (WAT)">Douala - WAT (UTC+1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono tracking-widest uppercase text-[10px] font-extrabold mb-2 font-bold">Format de date par défaut *</label>
                  <select
                    value={getParamVal("DATE_FORMAT")}
                    onChange={(e) => onSaveParameter("DATE_FORMAT", e.target.value)}
                    className="w-full bg-slate-50 p-3 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="Format 2 (DD/MM/YYYY HH:mm)">Format ISO (DD/MM/YYYY HH:mm)</option>
                    <option value="Format 1 (YYYY-MM-DD)">Standard International (YYYY-MM-DD)</option>
                  </select>
                </div>
              </div>

              {/* Danger Zone - Purge to 0000 */}
              <div className="p-5 border border-red-150 bg-red-50/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-red-600">
                  <Icons.Trash2 className="w-4.5 h-4.5" />
                  <h4 className="text-[12px] uppercase tracking-wider font-extrabold font-mono text-red-700">Zone de Danger — Purge Générale</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Cette commande efface instantanément toutes les fiches de paie, dossiers, documents, demandes d'accréditations, transactions financières et cartes enregistrées sur le système. Tous les compteurs de statistiques de l'application repasseront à **zéro (0000)** sous stricte conformité réglementaire de débogage. Moins les comptes utilisateurs actifs assurant la sécurité de l'accès.
                </p>
                <div className="pt-1.5">
                  <button
                    onClick={handleSystemReset}
                    disabled={isResetting}
                    className={`px-4.5 py-2.5 bg-[#FF3B30] hover:bg-[#E03025] text-white text-[10px] tracking-wider uppercase font-extrabold rounded-xl transition-all cursor-pointer shadow-sm select-none inline-flex items-center gap-2 ${isResetting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isResetting ? (
                      <>
                        <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Purge en cours...
                      </>
                    ) : (
                      <>
                        <Icons.RefreshCw className="w-3.5 h-3.5" />
                        Réinitialiser l'application à zéro (0000)
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeSubTab === "security" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 text-xs font-medium shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">Règles de Sécurité & Force brute</h3>
              
              <div className="grid grid-cols-2 gap-4 pb-1">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Nombre d'essais autorisé avant blocage</label>
                  <input type="number" defaultValue={5} className="w-full bg-slate-50 p-3 border border-slate-200 rounded-xl text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">Durée du verrouillage temporaire (minutes)</label>
                  <input type="number" defaultValue={30} className="w-full bg-slate-50 p-3 border border-slate-200 rounded-xl text-slate-800 font-mono" />
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4.5 bg-red-50 text-[#FF3B30] rounded-2xl border border-red-100">
                <Icons.Lock className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed font-semibold">
                  Le système impose intrinsèquement le chiffrement et hachage cryptographique des identités via l'algorithme **BCrypt** de force d'itération logarithmique 12 conforme à la charte AFG Bank. Aucune action en clair n'est autorisée.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === "storage" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 text-xs font-medium shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">Hébergement & Intégrité documentaires</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Rétention automatique</span>
                    <span className="text-[10px] text-slate-400">Période légale de conservation en corbeille</span>
                  </div>
                  <input type="text" defaultValue="30 jours" className="w-28 text-center font-bold bg-slate-50 p-2 border border-slate-200 rounded-xl text-slate-800" />
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Plafond taille unitaire</span>
                    <span className="text-[10px] text-slate-400">Limite physique de téléversement RH</span>
                  </div>
                  <input type="text" defaultValue="50 Mo" className="w-28 text-center font-bold bg-slate-50 p-2 border border-slate-200 rounded-xl text-slate-800" />
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Hachage de Déduplication</span>
                    <span className="text-[10px] text-slate-400">Contrôle de l'empreinte d'intégrité</span>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg font-mono uppercase">SHA-256 natif</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "notifications" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 text-xs font-medium shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2.5">Système de notifications critiques (SMS/Email)</h3>
              <p className="text-slate-500 mb-2">Configurez la relance des alertes d'expiration de pièces d'identité gabonaises.</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0052CC] border-slate-300 rounded accent-[#0052CC]" />
                  <span className="text-slate-800 font-bold">Relancer les Directeurs d'Agence 15 jours avant la date limite d'identité</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0052CC] border-slate-300 rounded accent-[#0052CC]" />
                  <span className="text-slate-800 font-bold">Alerter la DRC en cas d'indexation suspecte non autorisée</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right System Health Check Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-xs font-medium h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-3 font-mono">Statut du Système</h3>
          
          <div className="space-y-3">
            
            {/* Spring Boot API Row */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Icons.Activity className="w-4 h-4 text-[#00C853]" />
                <div>
                  <span className="font-bold text-slate-800 block leading-none">Spring Boot API</span>
                  <span className="text-[9px] text-slate-400 font-bold">Node/Vite Engine</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15 text-[10px] font-bold rounded-lg leading-none font-sans">
                <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-pulse" />
                Live
              </div>
            </div>

            {/* PostgreSQL Row */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Icons.Database className="w-4 h-4 text-[#00C853]" />
                <div>
                  <span className="font-bold text-slate-800 block leading-none">PostgreSQL</span>
                  <span className="text-[9px] text-slate-400 font-bold">In-Memory Store</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15 text-[10px] font-bold rounded-lg leading-none font-sans">
                <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-pulse" />
                Live
              </div>
            </div>

            {/* AI Assistant Row */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Icons.Sparkles className="w-4 h-4 text-[#0A84FF]" />
                <div>
                  <span className="font-bold text-slate-800 block leading-none">IA Chatbot ARHI</span>
                  <span className="text-[9px] text-slate-400 font-bold">Gemini Pro Agent</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#0A84FF] border border-blue-100 text-[10px] font-bold rounded-lg leading-none font-sans">
                <span className="w-1.5 h-1.5 bg-[#0A84FF] rounded-full animate-pulse" />
                Prêt
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed text-center pt-2 font-medium">
            Direction Informatique & Innovation d'AFG BANK.<br />Gabon, Libreville © 2026.
          </p>
        </div>

      </div>
    </div>
  );
}
