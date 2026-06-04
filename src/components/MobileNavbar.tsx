/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { permissionsService } from "../services/permissions.service";

interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any;
  pendingRequestsCount: number;
}

export default function MobileNavbar({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  currentUser,
  pendingRequestsCount
}: MobileNavbarProps) {
  if (!isOpen) return null;

  const userRole = currentUser?.roleName || currentUser?.roleId || "CLIENT";
  const userPerms = currentUser?.permissions || [];

  const items = [
    { id: "dashboard", label: "Tableau de Bord", icon: "LayoutDashboard" },
    { id: "analytics", label: "Données & Analytics", icon: "BarChart3", requiredPermission: "DOCUMENT_READ" },
    { id: "documents", label: "Fichiers & Documents", icon: "Files", requiredPermission: "DOCUMENT_READ" },
    { id: "folders", label: "Dossiers RH", icon: "FolderClosed", requiredPermission: "DOCUMENT_READ" },
    { id: "employees", label: "Registre Employés", icon: "Users", requiredPermission: "EMPLOYEE_READ" },
    { id: "professional-cards", label: "Cartes Professionnelles", icon: "IdCard", requiredPermission: "CARD_GENERATE" },
    { id: "agencies", label: "Réseau Agences", icon: "Building2", requiredPermission: "AGENCY_VIEW" },
    { id: "roles", label: "Rôles d'Accès", icon: "Shield", requiredPermission: "ROLE_ASSIGN" },
    { id: "permissions", label: "Matrice Permissions", icon: "LockKeyhole", requiredPermission: "ROLE_ASSIGN" },
    { id: "chatbot", label: "Assistant ARHI IA", icon: "Sparkles", glow: true, requiredPermission: "CHATBOT_ACCESS" }
  ];

  // Filter items matching active roles and permissions list
  const filteredItems = items.filter(item => {
    if (item.requiredPermission) {
      return permissionsService.hasPermission(userRole, userPerms, item.requiredPermission);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Slide out panel */}
      <div className="absolute top-0 left-0 bottom-0 w-80 bg-slate-900 text-white shadow-2xl flex flex-col p-6 animate-slide-up bg-gradient-to-b from-slate-900 to-slate-955">
        
        {/* Header mobile */}
        <div className="flex justify-between items-center pb-5 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0052CC] rounded-lg flex items-center justify-center">
              <Icons.ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-xs tracking-wider uppercase">AFG Bank Mobile</p>
              <p className="text-[8px] text-emerald-400 font-mono">PORTAIL DE SECURITE</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* User compact indicator */}
        {currentUser && (
          <div className="mb-6 p-3 bg-white/5 rounded-2xl flex items-center gap-3">
            <img src={currentUser.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/20" />
            <div className="truncate">
              <h4 className="font-bold text-xs leading-none">{currentUser.fullName}</h4>
              <p className="text-[9px] text-[#0052CC] font-bold font-mono mt-0.5 uppercase tracking-wider">{currentUser.roleName || currentUser.roleId}</p>
            </div>
          </div>
        )}

        {/* Scrollable links */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredItems.map((item) => {
            const IconComp = (Icons as any)[item.icon] || Icons.File;
            const isSelected = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#0052CC] text-white font-bold shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "chatbot" && (
                  <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 mt-4 text-center">
          <p className="text-[9px] text-white/30 font-mono">AFG MOBILE PRO v4.4 · TOUS DROITS RESERVES</p>
        </div>

      </div>
    </div>
  );
}
