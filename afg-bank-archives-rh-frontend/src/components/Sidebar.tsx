/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import * as Icons from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  currentUser: {
    fullName: string;
    position: string;
    matricule: string;
    photoUrl: string;
  } | null;
}

export default function Sidebar({ currentTab, onTabChange, currentUser }: SidebarProps) {
  // Navigation links conforming strictly to the requested architecture
  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: Icons.LayoutDashboard },
    { id: "employees", label: "Employés", icon: Icons.UsersRound },
    { id: "documents", label: "Archives GED", icon: Icons.FileText },
    { id: "professional-cards", label: "Badges & Cartes", icon: Icons.ScanFace },
    { id: "trash", label: "Corbeille Rétention", icon: Icons.Trash2 },
    { id: "permissions", label: "Habilitations & Rôles", icon: Icons.ShieldCheck },
    { id: "history", label: "Registre d'Identité / Logs", icon: Icons.History },
    { id: "parameters", label: "Paramètres Système", icon: Icons.SlidersHorizontal },
  ];

  return (
    <aside className="w-80 h-screen bg-gradient-to-b from-[#0052CC] to-[#003E99] text-white flex flex-col justify-between shadow-glow select-none shrink-0 border-r border-[#0052CC]/10">
      
      {/* Top Corporate Branding Block */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex items-center justify-center font-black text-white text-lg tracking-wider shadow-inner">
            AFG
          </div>
          <div>
            <h1 className="font-sans font-black tracking-tight text-white text-base leading-none">AFG BANK</h1>
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-mono font-extrabold mt-1">Gabon • Archives RH</p>
          </div>
        </div>

        {/* Dynamic Badge indicating security compliance */}
        <div className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-2">
          <Icons.ShieldCheck className="w-4 h-4 text-[#00C853] shrink-0" />
          <span className="text-[9px] font-mono tracking-wider font-extrabold text-white/80 uppercase">
            Accès Sécurisé SSL
          </span>
        </div>
      </div>

      {/* Main Tab Navigation Options */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold font-sans transition-all duration-200 cursor-pointer text-left group border ${
                isActive
                  ? "bg-white text-[#0052CC] border-white shadow-premium font-black"
                  : "bg-transparent text-white/70 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-[#0052CC]" : "text-white/60 group-hover:text-white"
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Authenticated User Bio Card */}
      <div className="p-6 border-t border-white/10 bg-black/10 backdrop-blur-md">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <img
              src={currentUser.photoUrl}
              alt=""
              className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-sm shrink-0 bg-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-black text-xs leading-none uppercase truncate">{currentUser.fullName}</h4>
              <p className="text-white/50 text-[10px] truncate mt-1">{currentUser.position}</p>
              <span className="text-[9px] text-[#00C853] font-mono font-bold tracking-widest block mt-1.5 leading-none">
                {currentUser.matricule}
              </span>
            </div>
            <Icons.LogIn className="w-4 h-4 text-white/40 shrink-0 hover:text-white cursor-pointer transition-colors" title="Changer d'utilisateur" />
          </div>
        ) : (
          <div className="text-center text-white/40 text-xs py-2 font-bold font-mono">
            Aucun utilisateur connecté
          </div>
        )}
      </div>

    </aside>
  );
}
