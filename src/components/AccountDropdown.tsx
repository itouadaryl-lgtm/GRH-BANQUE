/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLogout: () => void;
}

export default function AccountDropdown({ isOpen, onClose, currentUser, onLogout }: AccountDropdownProps) {
  if (!isOpen) return null;

  const sections = [
    {
      title: "Gouvernance & Profil",
      items: [
        { icon: "User", label: "Voir profil / Identité", desc: "Informations contractuelles", subOpts: ["Fiche Individuelle", "Changer d'agence"] },
        { icon: "Edit3", label: "Modifier profil", desc: "Mettre à jour vos coordonnées", subOpts: [] },
      ]
    },
    {
      title: "Citadelle de Sécurité",
      items: [
        { icon: "Lock", label: "Changer mot de passe", desc: "Mise à jour régulière de la clé", subOpts: [] },
        { icon: "ShieldCheck", label: "Double authentification", desc: "Validation OTP SMS/Auth active", subOpts: [] },
        { icon: "Activity", label: "Sessions actives & logs", desc: "2 terminaux connectés actuellement", subOpts: ["Terminal Actuel: Libreville", "Historique de connexions"] }
      ]
    },
    {
      title: "Coffre-fort Documentaire",
      items: [
        { icon: "FolderLock", label: "Mes documents sécurisés", desc: "Fichiers de paie & attestations", subOpts: [] },
        { icon: "DownloadCloud", label: "Mes téléchargements", desc: "Fichiers exportés récemment", subOpts: [] },
        { icon: "Archive", label: "Archives froides", desc: "Documents de plus de 5 ans", subOpts: [] }
      ]
    },
    {
      title: "Intendance & Finances",
      items: [
        { icon: "DollarSign", label: "Mes paiements & salaires", desc: "Historique des virements émis", subOpts: [] },
        { icon: "Sparkles", label: "Abonnement IA & quotas", desc: "Droit d'accès LLM ARHI : Illimité", subOpts: [] }
      ]
    },
    {
      title: "Notifications & Réseau",
      items: [
        { icon: "Mail", label: "Préférences emails & digests", desc: "Récapitulatif d'activité quotidien", subOpts: [] },
        { icon: "BellRing", label: "Alerte push temps réel", desc: "Système de triggers immédiats", subOpts: [] }
      ]
    },
    {
      title: "Configuration",
      items: [
        { icon: "Languages", label: "Langue & Clavier", desc: "Sélection : Français (Gabon)", subOpts: [] },
        { icon: "Sun", label: "Thème d'interface", desc: "Aperçu : Blanc Éclatant", subOpts: [] },
        { icon: "Eye", label: "Accessibilité universelle", desc: "Zoom, contrastes et synthèses", subOpts: [] }
      ]
    },
    {
      title: "Assistance & Support",
      items: [
        { icon: "HelpCircle", label: "Aide & Documentation", desc: "Prise en main d'AFG GED", subOpts: [] },
        { icon: "MessageSquareCode", label: "Contacter le support DSI", desc: "Ticket prioritaire Libreville", subOpts: [] }
      ]
    }
  ];

  return (
    <>
      {/* Invisible overlay for background click closure */}
      <div className="fixed inset-0 z-45 cursor-default" onClick={onClose} />

      <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl border border-slate-150 rounded-3xl shadow-2xl z-50 overflow-hidden animate-slide-up flex flex-col text-slate-700 max-h-[85vh]">
        {/* Top styling strip */}
        <div className="bg-gradient-to-r from-[#0052CC] to-[#0A84FF] px-6 py-5 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt={currentUser?.fullName}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-white/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0052CC]" />
            </div>
            <div className="truncate">
              <h4 className="font-bold text-sm tracking-wide leading-none">{currentUser?.fullName}</h4>
              <p className="text-[10px] font-mono font-medium text-white/80 mt-1 uppercase tracking-widest">{currentUser?.roleName || "Super Admin"}</p>
              <p className="text-[9px] text-white/60 font-mono mt-0.5">{currentUser?.matricule || "AFG-0000"}</p>
            </div>
          </div>
        </div>

        {/* Dense highly functional scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] scrollbar-thin">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5 label-section">
              <span className="px-2 text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">
                {section.title}
              </span>

              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const Icon = (Icons as any)[item.icon] || Icons.ChevronRight;
                  return (
                    <div key={itemIdx} className="group rounded-xl overflow-hidden hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all p-2.5 cursor-pointer" onClick={() => alert(`Action simulée : ${item.label}`)}>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-[#0052CC]/10 group-hover:text-[#0052CC] flex items-center justify-center shrink-0 transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-805 group-hover:text-[#0052CC] leading-snug transition-colors">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 truncate">
                            {item.desc}
                          </p>
                          {item.subOpts && item.subOpts.length > 0 && (
                            <div className="flex gap-2.5 mt-2.5 flex-wrap">
                              {item.subOpts.map((o, oIdx) => (
                                <span key={oIdx} className="bg-slate-100 group-hover:bg-slate-200/50 text-[8.5px] font-mono font-bold text-slate-500 px-1.5 py-0.5 rounded transition-all">
                                  {o}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Account actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-between gap-3">
          <div className="text-[9.5px] font-mono text-slate-400">
            Dernier synchro: Juste à l'instant
          </div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 text-rose-500 border border-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Icons.LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
