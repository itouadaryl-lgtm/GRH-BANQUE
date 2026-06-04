/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import SidebarAccountMenu from "./SidebarAccountMenu";
import { permissionsService } from "../services/permissions.service";

interface DynamicSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any;
  pendingRequestsCount: number;
  onLoginClick?: () => void;
  onLogout: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  requiredPermission?: string;
  badge?: string;
  glow?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export default function DynamicSidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  pendingRequestsCount,
  onLoginClick,
  onLogout
}: DynamicSidebarProps) {
  const [internalSearch, setInternalSearch] = useState("");

  const userRole = currentUser?.roleName || currentUser?.roleId || "CLIENT";
  const userPerms = currentUser?.permissions || [];

  // Full catalog of features mapped securely to their requisite permission!
  const sections: SidebarSection[] = [
    {
      title: "Pilotage & Accueil",
      items: [
        { id: "dashboard", label: "Tableau de Bord / Accueil", icon: "LayoutDashboard" },
        { id: "analytics", label: "Données & Analytics", icon: "BarChart3", requiredPermission: "DOCUMENT_READ" },
        { id: "activity-logs", label: "Journal d'Activités", icon: "ScrollText", requiredPermission: "ROLE_ASSIGN" }
      ]
    },
    {
      title: "Archivage & Modules",
      items: [
        { id: "documents", label: "Fichiers & Documents", icon: "Files", requiredPermission: "DOCUMENT_READ" },
        { id: "folders", label: "Dossiers RH", icon: "FolderClosed", requiredPermission: "DOCUMENT_READ" },
        { id: "document-types", label: "Gabarits de Documents", icon: "FileCode", requiredPermission: "ROLE_ASSIGN" }
      ]
    },
    {
      title: "Ressources Humaines",
      items: [
        { id: "employees", label: "Registre Collaborateurs", icon: "Users", requiredPermission: "EMPLOYEE_READ" },
        { id: "professional-cards", label: "Cartes Professionnelles", icon: "IdCard", requiredPermission: "CARD_GENERATE" },
        { id: "agencies", label: "Réseau Agences / National", icon: "Building2", requiredPermission: "AGENCY_VIEW" }
      ]
    },
    {
      title: "Habilitations & Flux",
      items: [
        { id: "roles", label: "Rôles d'Accès", icon: "Shield", requiredPermission: "ROLE_ASSIGN" },
        { id: "permissions", label: "Matrice Habilitations", icon: "LockKeyhole", requiredPermission: "ROLE_ASSIGN" },
        { id: "workflow", label: "Workflows Décloisons", icon: "Route", requiredPermission: "CHATBOT_ACCESS" },
        { id: "trash", label: "Rétention & Corbeille", icon: "Trash2", badge: "RESTREINT", requiredPermission: "DOCUMENT_DELETE" }
      ]
    },
    {
      title: "Sécurité & Services",
      items: [
        { id: "chatbot", label: "Assistant ARHI IA", icon: "Sparkles", glow: true, requiredPermission: "CHATBOT_ACCESS" },
        { id: "notifications", label: "Alertes d'Accréditation", icon: "Bell", badge: pendingRequestsCount ? String(pendingRequestsCount) : undefined, requiredPermission: "DOCUMENT_READ" }
      ]
    }
  ];

  // Filter sections and items dynamically according to user RBAC rights and sidebar search string
  const filteredSections = sections
    .map(section => {
      const items = section.items.filter(item => {
        // Search filter matching
        const matchesSearch =
          item.label.toLowerCase().includes(internalSearch.toLowerCase()) ||
          item.id.toLowerCase().includes(internalSearch.toLowerCase());

        if (!matchesSearch) return false;

        // RBAC verification logic
        if (item.requiredPermission) {
          return permissionsService.hasPermission(userRole, userPerms, item.requiredPermission);
        }

        return true; // No explicit permission guard -> open tabs
      });

      return { ...section, items };
    })
    .filter(section => section.items.length > 0);

  return (
    <aside className="w-76 bg-gradient-to-b from-[#0B1E3F] via-[#0E2856] to-[#050F21] text-white flex flex-col h-screen shrink-0 overflow-hidden shadow-2xl relative select-none">
      {/* Visual background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0052CC]/15 to-transparent pointer-events-none z-0" />

      {/* Corporate branding and Account drawer */}
      <div className="relative z-10 px-6 py-5 border-b border-white/5 bg-white/[0.02] shrink-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <Icons.ShieldCheck className="w-6 h-6 text-[#0052CC]" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm tracking-wide text-white leading-none">
              AFG BANK GABON
            </h1>
            <p className="text-[8.5px] text-emerald-400 tracking-wider font-mono font-bold uppercase mt-1">
              SYSTEME SECURISE GED
            </p>
          </div>
        </div>

        {/* Live compact Profile and Login triggers */}
        <SidebarAccountMenu
          currentUser={currentUser}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
        />

        {/* Dynamic Sidebar menu items search */}
        <div className="relative flex items-center">
          <Icons.Search className="w-3.5 h-3.5 text-white/40 absolute left-3" />
          <input
            type="text"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Filtrer les modules autorisés..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-white/30"
          />
          {internalSearch && (
            <button onClick={() => setInternalSearch("")} className="absolute right-2.5 text-white/40 hover:text-white">
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main permission-based dynamic menu items layout */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3.5 mb-1.5 text-[8.5px] font-bold tracking-widest text-white/35 uppercase font-mono">
              {section.title}
            </h3>
            <div className="space-y-[2px]">
              {section.items.map((item) => {
                const IconComponent = (Icons as any)[item.icon] || Icons.File;
                const isSelected = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11.5px] font-semibold tracking-wide transition-all group cursor-pointer border ${
                      isSelected
                        ? "bg-[#0052CC]/15 text-white border-[#0052CC]/30 shadow-[0_4px_12px_rgba(0,82,204,0.15)] font-bold scale-[1.01]"
                        : "text-white/70 border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                          isSelected ? "text-[#0052CC]" : "text-white/60 group-hover:text-white"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[8px] rounded-full font-mono font-bold tracking-wider leading-none ${
                        item.id === "trash"
                          ? isSelected ? "bg-red-500/20 text-red-300" : "bg-red-500/10 text-red-200 border border-red-500/10"
                          : "bg-white/15 text-white"
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.glow && !isSelected && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lower footer segment with Libreville engineering details */}
      <div className="relative z-10 p-4 border-t border-white/5 bg-black/20 shrink-0 space-y-3">
        <button
          onClick={() => alert("Assistance technique centrale notifiée. Un technicien DSI Libreville prend contact.")}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-white/90 border border-white/5 transition-all text-left cursor-pointer"
        >
          <Icons.LifeBuoy className="w-4 h-4 text-emerald-400" />
          <div className="flex-1 min-w-0">
            <p className="leading-none">Assistance DSI Gabon</p>
            <p className="text-[9px] text-white/40 font-mono font-bold mt-0.5">Ticket urgent H24</p>
          </div>
          <Icons.Link className="w-3 h-3 text-white/30" />
        </button>

        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono px-1">
          <span className="font-bold">DYNAMIC v4.4</span>
          <span>ROLE: {userRole}</span>
        </div>

        {currentUser && (
          <button
            onClick={() => {
              if (confirm("Voulez-vous réinitialiser votre session de travail ?")) {
                onLogout();
              }
            }}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/10 hover:border-rose-500/25 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons.LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion Session</span>
          </button>
        )}
      </div>
    </aside>
  );
}
