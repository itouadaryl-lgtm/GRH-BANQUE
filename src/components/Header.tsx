/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";

interface HeaderProps {
  currentUser: any;
  onChangeUser: (userId: string) => void;
  availableUsers: any[];
  voirToutActive?: boolean;
  onToggleVoirTout?: (active: boolean) => Promise<void>;
}

export default function Header({
  currentUser,
  onChangeUser,
  availableUsers,
  voirToutActive = false,
  onToggleVoirTout
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAgencySelect, setShowAgencySelect] = useState(false);

  const userRole = currentUser?.roleName;
  const isAuthorizedForVoirTout = currentUser?.agencyId === "ag-siege" && (userRole === "SUPER_ADMIN" || userRole === "DRH");

  // High quality notifications Feed
  const notifications = [
    { id: 1, text: "Nouveau contrat versé par Marie Claire (RH Manager).", time: "Il y a 2 minutes", unread: true },
    { id: 2, text: "Demande d'accès temporaire en attente d'approbation.", time: "Il y a 10 minutes", unread: true },
    { id: 3, text: "Sauvegarde complète des coffres cryptés effectuée.", time: "Il y a 1 heure", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-sm backdrop-blur-md">
      
      {/* Search Input Bar & Real Agency Selector */}
      <div className="flex items-center gap-6">
        
        {/* Dynamic Breadcrumb / Indicator */}
        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-widest font-mono">
            Réseau National Gabon
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-semibold text-slate-800">AFG BANK Central</span>
            <Icons.ChevronRight className="w-3.5 h-3.5 text-slate-450" />
            <span className="text-xs font-medium text-slate-500 italic font-serif">Service Archivage</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex items-center gap-2 w-80 relative">
          <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Rechercher un fichier, un matricule, un rôle..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/70 rounded-full text-xs font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Top Action Controls */}
      <div className="flex items-center gap-4">
        
        {/* Secure "VOIR TOUT" Bank Supervision Switch */}
        {isAuthorizedForVoirTout && onToggleVoirTout && (
          <button
            onClick={() => onToggleVoirTout(!voirToutActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer font-bold text-[10px] select-none ${
              voirToutActive
                ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/20"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
            title="Permuter entre le cloisonnement de votre agence locale et la supervision de tout le réseau GABON"
          >
            <Icons.Eye className={`w-3.5 h-3.5 ${voirToutActive ? "animate-pulse" : "text-slate-400"}`} />
            <span>SUPERVISION NATIONALE : {voirToutActive ? "ACTIVE (VOIR TOUT)" : "INACTIVE (SIÈGE SEUL)"}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${voirToutActive ? "bg-white animate-ping" : "bg-emerald-500"}`} />
          </button>
        )}

        {/* Local Cloisonnement Feedback lock shield */}
        {!isAuthorizedForVoirTout && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#0052CC] rounded-full border border-blue-100 text-[10px] font-bold tracking-wide select-none">
            <Icons.Lock className="w-3 h-3 text-[#0052CC]" />
            <span>VUE CLOISONNÉE SECURE d'AFG {currentUser?.agencyId === "ag-libreville" ? "LIBREVILLE" : currentUser?.agencyId === "ag-portgentil" ? "PORT-GENTIL" : currentUser?.agencyId === "ag-owendo" ? "OWENDO" : "REGION"}</span>
          </div>
        )}

        {/* Network & Safety Health Check Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#00C853]/10 text-[#00C853] rounded-full border border-[#00C853]/15 text-[10px] font-bold tracking-wide">
          <span className="w-2 h-2 bg-[#00C853] rounded-full animate-pulse" />
          CRYPTAGE AES-256 ACTIF
        </div>

        {/* Swagger Premium API Button */}
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] hover:text-[#0a3fa1] rounded-full border border-blue-200 transition-all text-[11px] font-bold shrink-0 shadow-sm cursor-pointer"
        >
          <Icons.BookOpen className="w-3.5 h-3.5" />
          <span>DOC SWAGGER API</span>
        </a>

        {/* Agency Selector Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAgencySelect(!showAgencySelect)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
          >
            <Icons.Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Siège Libreville</span>
            <Icons.ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showAgencySelect && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-55 overflow-hidden py-1.5 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Bureaux Nationaux</span>
              </div>
              <div className="text-xs text-slate-700">
                <button onClick={() => setShowAgencySelect(false)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between font-semibold">
                  <span>Siège Libreville</span>
                  <Icons.Check className="w-3.5 h-3.5 text-[#0052CC]" />
                </button>
                <button onClick={() => { alert("Connexion sécurisée en cours avec Port-Gentil..."); setShowAgencySelect(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between font-normal">
                  <span>Agence Port-Gentil</span>
                </button>
                <button onClick={() => { alert("Connexion sécurisée en cours avec Oyem..."); setShowAgencySelect(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between font-normal">
                  <span>Agence Oyem</span>
                </button>
                <button onClick={() => { alert("Connexion sécurisée en cours avec Franceville..."); setShowAgencySelect(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between font-normal">
                  <span>Agence Franceville</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Intelligent Push Alerts Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full border border-slate-205 transition-all relative cursor-pointer"
          >
            <Icons.Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF3B30] rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-3xl shadow-xl z-50 text-xs overflow-hidden pb-1 animate-slide-up">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Notifications de Sécurité</span>
                <span className="text-[10px] text-[#0052CC] font-bold cursor-pointer hover:underline">Marquer lu</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-slate-50/50 transition-colors flex gap-3 ${n.unread ? "bg-slate-50/30" : ""}`}>
                    <div className="w-2.5 h-2.5 mt-1 rounded-full shrink-0 bg-[#0052CC]" />
                    <div>
                      <p className="text-slate-700 font-semibold leading-relaxed">{n.text}</p>
                      <span className="text-[9.5px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Identity & Privilege Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 pl-3 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full transition-all text-left cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt={currentUser?.fullName}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00C853] rounded-full border-2 border-white" />
            </div>
            <div className="hidden md:block">
              <h4 className="text-xs font-bold text-slate-800 leading-none group-hover:text-[#0052CC] transition-colors">
                {currentUser?.fullName}
              </h4>
              <p className="text-[9.5px] font-mono font-bold text-[#0052CC] mt-1 tracking-widest uppercase">
                {currentUser?.roleName || "SUPER_ADMIN"}
              </p>
            </div>
            <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 group-hover:text-slate-600 transition-colors" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2.5 w-68 bg-white border border-slate-150 rounded-3xl shadow-2xl z-55 overflow-hidden pb-1 animate-slide-up">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest font-mono">Aiguillage Multi-Identités</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Changez d'utilisateur pour prévisualiser les règles de permissions et l'isolation des agences.</p>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onChangeUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-5 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${u.id === currentUser?.id ? "bg-slate-50/70" : ""}`}
                  >
                    <img src={u.photoUrl} alt={u.fullName} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 leading-none">{u.fullName}</p>
                      <p className="text-[9px] text-[#0052CC] font-bold mt-1.5 uppercase font-mono tracking-wider">{u.position} ({u.matricule})</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <span className="text-[9.5px] font-mono text-slate-400 block">Environnement Local (Port 3000)</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
