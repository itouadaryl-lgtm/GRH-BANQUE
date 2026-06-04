/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import UserMenu from "./UserMenu";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  currentUser: any;
  onChangeUser: (userId: string) => void;
  availableUsers: any[];
  voirToutActive?: boolean;
  onToggleVoirTout?: (active: boolean) => Promise<void>;
  onLoginClick: () => void;
  onLogout: () => void;
  activeTab: string;
  onHamburgerClick: () => void;
}

export default function Navbar({
  currentUser,
  onChangeUser,
  availableUsers,
  voirToutActive = false,
  onToggleVoirTout,
  onLoginClick,
  onLogout,
  activeTab,
  onHamburgerClick
}: NavbarProps) {
  const [showIdentityMenu, setShowIdentityMenu] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const userRole = currentUser?.roleName;
  const isAuthorizedForVoirTout = currentUser?.agencyId === "ag-siege" && (userRole === "SUPER_ADMIN" || userRole === "DRH");

  // Premium Notification register
  const notifications = [
    { id: 101, type: "CONTRAT", title: "Contrat de Travail indexé", desc: "Saisi pour M. Paul Obiang par le service DRH.", time: "2 min", unread: true },
    { id: 102, type: "ACCÈS", title: "Requête de décloisonnement", desc: "Sophie Minko demande l'accès au dossier d'agence Port-Gentil.", time: "12 min", unread: true },
    { id: 103, type: "SÉCURITÉ", title: "Badge crypté généré", desc: "Matricule AFG260022 validé avec signature SHA-256.", time: "1h", unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm gap-4 transition-all">
      
      {/* LEFT SECTION (Génération logo, titre et hamburger mobile) - 20% default space */}
      <div className="flex items-center gap-3.5 lg:w-[22%] min-w-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onHamburgerClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer select-none"
          aria-label="Ouvrir le menu"
        >
          <Icons.Menu className="w-5 h-5" />
        </button>

        {/* Corporate High Clarity Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#0052CC] to-[#0A84FF] rounded-xl flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,82,204,0.22)]">
            <Icons.ShieldCheck className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="truncate hidden sm:block">
            <h1 className="font-display font-black text-sm tracking-wide text-slate-900 uppercase leading-none">
              AFG BANK
            </h1>
            <span className="text-[8px] text-[#0052CC] tracking-widest font-mono font-bold block mt-1 uppercase">
              RESEAU GABON CENTRAL
            </span>
          </div>
        </div>
      </div>

      {/* CENTER SECTION (Recherche intelligente et navigation dynamique) - 50% space with perfect padding */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:w-[48%] px-2">
        {/* Breadcrumb Info widget */}
        <div className="hidden xl:flex flex-col text-left shrink-0 max-w-[150px]">
          <span className="text-[8.5px] uppercase font-mono font-bold text-slate-400 tracking-wider">
            Page active
          </span>
          <span className="text-[11.5px] font-bold text-slate-800 font-sans truncate capitalize">
            {activeTab === "dashboard" ? "Tableau de Bord" : activeTab === "employees" ? "Collaborateurs" : activeTab === "documents" ? "GED d'AFG" : activeTab}
          </span>
        </div>

        {/* Intelligent Search Input occupy dynamic spaces */}
        <div className="relative w-full max-w-lg flex items-center group">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-4 group-focus-within:text-[#0052CC] transition-colors" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Intuitif: recherchez par matricule, nom de fichier, contrat..."
            className="w-full pl-11 pr-10 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-[11px] font-semibold text-slate-800 placeholder:text-slate-450 focus:outline-none focus:bg-white focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/5 transition-all text-ellipsis"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SECTION (Actions, Boutons Connexion / Compte et Avatars) - 30% space */}
      <div className="flex items-center justify-end gap-3.5 lg:w-[30%] shrink-0">
        
        {/* Secure global switcher */}
        {isAuthorizedForVoirTout && onToggleVoirTout && (
          <button
            onClick={() => onToggleVoirTout(!voirToutActive)}
            className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-bold text-[9.5px] select-none ${
              voirToutActive
                ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
            title="Permuter le cloisonnement"
          >
            <Icons.Eye className="w-3.5 h-3.5" />
            <span className="truncate">SUPERVISION : {voirToutActive ? "active" : "OFF"}</span>
          </button>
        )}

        {/* Global Security Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#00C853]/10 text-[#00C853] rounded-full border border-[#00C853]/15 text-[8.5px] font-mono font-bold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-pulse" />
          AES_256 CENTRAL
        </div>

        {/* Swagger Doc short pathway */}
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#0052CC] rounded-full border border-slate-200 transition-all text-[10px] font-bold cursor-pointer"
        >
          <Icons.BookOpen className="w-3.5 h-3.5 text-[#0052CC]/75" />
          <span>API DOC</span>
        </a>

        {/* Identity Selector Drawer for validation tests */}
        <div className="relative">
          <button
            onClick={() => {
              setShowIdentityMenu(!showIdentityMenu);
              setShowNotificationCenter(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full border border-slate-200 transition-all cursor-pointer"
            title="Changer de compte d'accréditation"
          >
            <Icons.UserCog className="w-4 h-4" />
          </button>

          {showIdentityMenu && (
            <div className="absolute right-0 mt-3.5 w-72 bg-white border border-slate-150 rounded-2xl shadow-xl z-55 overflow-hidden pb-1 animate-slide-up">
              <div className="px-4.5 py-3.5 bg-slate-50 border-b border-slate-100">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider font-mono">Démonstrateur d'Habilitations</span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                  Permutez instantanément pour tester d'autres profils et isolations locales.
                </p>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onChangeUser(u.id);
                      setShowIdentityMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-all cursor-pointer ${currentUser?.id === u.id ? "bg-slate-50/80 font-bold" : ""}`}
                  >
                    <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 leading-none truncate">{u.fullName}</p>
                      <p className="text-[9px] text-[#0052CC] font-bold font-mono mt-0.5 uppercase tracking-wider">{u.roleName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification dynamic center */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationCenter(!showNotificationCenter);
              setShowIdentityMenu(false);
            }}
            className="p-2 text-slate-500 hover:text-[#0052CC] hover:bg-[#0052CC]/5 border border-slate-205 rounded-full transition-all relative cursor-pointer"
            aria-label="Afficher les notifications"
          >
            <Icons.Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          {showNotificationCenter && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl z-55 overflow-hidden animate-slide-up pb-1.5">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">Alertes Opérationnelles</span>
                <span className="text-[9.5px] text-[#0052CC] font-bold cursor-pointer hover:underline">Tout lire</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-55/60 transition-colors flex gap-2.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${n.unread ? "bg-[#0052CC]" : "bg-slate-250"}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal leading-relaxed">{n.desc}</p>
                      <span className="text-[9px] text-slate-400 font-mono inline-block mt-1">{n.time} ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile toggle button (including premium Account dropdown options) */}
        <UserMenu
          currentUser={currentUser}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
        />

      </div>

    </nav>
  );
}
