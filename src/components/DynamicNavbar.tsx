/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import UserMenu from "./UserMenu";
import { permissionsService } from "../services/permissions.service";

interface DynamicNavbarProps {
  currentUser: any;
  onChangeUser?: (userId: string) => void;
  availableUsers?: any[];
  voirToutActive?: boolean;
  onToggleVoirTout?: (active: boolean) => Promise<void>;
  onLoginClick?: () => void;
  onLogout: () => void;
  activeTab: string;
  onHamburgerClick: () => void;

  // Unified global search inputs based on role
  employees?: any[];
  folders?: any[];
  documents?: any[];
  onInstantSelectResult?: (type: string, id: string) => void;
}

export default function DynamicNavbar({
  currentUser,
  onChangeUser,
  availableUsers = [],
  voirToutActive = false,
  onToggleVoirTout,
  onLoginClick,
  onLogout,
  activeTab,
  onHamburgerClick,
  employees = [],
  folders = [],
  documents = [],
  onInstantSelectResult
}: DynamicNavbarProps) {
  const [showIdentityMenu, setShowIdentityMenu] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const userRole = currentUser?.roleName || currentUser?.roleId || "CLIENT";
  const userPerms = currentUser?.permissions || [];

  // Supervision button is restricted based on RBAC! (needs either Super Admin role or general view supervision permission)
  const isAuthorizedForSupervision = 
    userRole === "SUPER_ADMIN" || 
    permissionsService.hasPermission(userRole, userPerms, "AGENCY_MANAGE");

  // Notifications custom filtered based on role!
  const notificationsCatalog = [
    { id: 101, type: "SYS", title: "Contrat de Travail indexé", desc: "Saisi pour M. Paul Obiang par le service DRH.", roles: ["SUPER_ADMIN", "DRH", "RH_MANAGER"] },
    { id: 102, type: "SYS", title: "Accès de déconnexion", desc: "Audit centralisé complété sur l'agence d'Owendo.", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
    { id: 103, type: "SYS", title: "Fiche d'habilitation générée", desc: "Votre matricule a été validé.", roles: ["EMPLOYEE"] },
    { id: 104, type: "SYS", title: "Signature d'identité validée", desc: "Attestation #24-91 validée par le secrétariat.", roles: ["CLIENT"] }
  ];

  const filteredNotifications = notificationsCatalog.filter(
    n => n.roles.includes(userRole) || userRole === "SUPER_ADMIN"
  );

  // Role proportionate universal search filters
  const hasEmployeeAccess = userRole === "SUPER_ADMIN" || userRole === "DRH" || userRole === "RH_MANAGER";
  
  const matchingEmployees = searchValue.trim() && hasEmployeeAccess
    ? [...employees]
        .filter(e => e.fullName.toLowerCase().includes(searchValue.toLowerCase()) || (e.matricule || "").toLowerCase().includes(searchValue.toLowerCase()))
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .slice(0, 4)
    : [];

  const matchingFolders = searchValue.trim()
    ? [...folders]
        .filter(f => {
          // If employee, can only see their own folders
          if (userRole === "EMPLOYEE") {
            return f.ownerId === currentUser.id && (f.name.toLowerCase().includes(searchValue.toLowerCase()) || f.description.toLowerCase().includes(searchValue.toLowerCase()));
          }
          return f.name.toLowerCase().includes(searchValue.toLowerCase()) || f.description.toLowerCase().includes(searchValue.toLowerCase());
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 4)
    : [];

  const matchingDocs = searchValue.trim()
    ? [...documents]
        .filter(d => {
          if (d.isDeleted) return false;
          // If employee, can only see their own docs
          if (userRole === "EMPLOYEE") {
            return d.employeeId === currentUser.id && (d.originalFileName.toLowerCase().includes(searchValue.toLowerCase()) || (d.description || "").toLowerCase().includes(searchValue.toLowerCase()));
          }
          return d.originalFileName.toLowerCase().includes(searchValue.toLowerCase()) || (d.description || "").toLowerCase().includes(searchValue.toLowerCase());
        })
        .sort((a, b) => a.originalFileName.localeCompare(b.originalFileName))
        .slice(0, 4)
    : [];

  const totalResultsCount = matchingEmployees.length + matchingFolders.length + matchingDocs.length;

  return (
    <nav className="w-full bg-white/85 backdrop-blur-md border-b border-slate-100 h-20 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm gap-4 transition-all">
      
      {/* Brand logo block */}
      <div className="flex items-center gap-3.5 lg:w-[22%] min-w-0">
        <button
          onClick={onHamburgerClick}
          className="lg:hidden p-2 text-slate-550 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          aria-label="Menu principal"
        >
          <Icons.Menu className="w-5 h-5" />
        </button>

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

      {/* Center dynamic modules info and search fields */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:w-[48%] px-2">
        <div className="hidden xl:flex flex-col text-left shrink-0 max-w-[155px]">
          <span className="text-[8.5px] uppercase font-mono font-bold text-slate-400 tracking-wider">Module Actif</span>
          <span className="text-[11.5px] font-bold text-slate-800 capitalize truncate">
            {activeTab === "dashboard" ? "Tableau de Bord" : activeTab === "employees" ? "Collaborateurs" : activeTab === "documents" ? "GED d'AFG" : activeTab}
          </span>
        </div>

        {/* Dynamic customized search helper depending on permissions! */}
        <div className="relative w-full max-w-lg flex flex-col group">
          <div className="relative w-full flex items-center">
            <Icons.Search className="w-4 h-4 text-slate-400 absolute left-4 group-focus-within:text-[#0052CC] transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                userRole === "SUPER_ADMIN" || userRole === "DRH" 
                  ? "Recherchez par matricule, agence, document, log..."
                  : "Recherchez un document ou justificatif..."
              }
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50/75 border border-slate-200/90 rounded-2xl text-[11px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/5 transition-all truncate"
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

          {/* Search Result Overlay Dropdown */}
          {searchValue.trim().length > 0 && (
            <>
              {/* Overlay background to dismiss popup */}
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setSearchValue("")} />
              
              <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-[380px] overflow-y-auto divide-y divide-slate-100 font-sans text-xs text-slate-700 animate-slide-up p-3">
                <div className="px-3 pb-2 pt-1 border-b border-slate-50 flex justify-between items-center text-[10px] font-mono text-slate-400 font-black uppercase">
                  <span>Recherche Universelle AFG</span>
                  <span className="px-2 py-0.5 bg-[#0052CC]/15 text-[#0052CC] rounded font-mono text-[9px] font-bold">
                    {totalResultsCount} Résultats
                  </span>
                </div>

                {/* Group 1: Collaborators */}
                {matchingEmployees.length > 0 && (
                  <div className="py-2.5">
                    <h4 className="px-3 text-[9.5px] font-mono tracking-widest uppercase font-bold text-[#0052CC] mb-1">
                      Collaborateurs ({matchingEmployees.length})
                    </h4>
                    <div className="space-y-px">
                      {matchingEmployees.map(e => (
                        <button
                          key={e.id}
                          onClick={() => {
                            if (onInstantSelectResult) onInstantSelectResult("employee", e.id);
                            setSearchValue("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-3 text-slate-750 font-semibold cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={e.photoUrl} alt="" className="w-6 h-6 rounded-lg object-cover shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-805 truncate">{e.fullName}</p>
                              <p className="text-[9.5px] text-slate-450 truncate leading-none mt-0.5">{e.position}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">{e.matricule}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group 2: Folders */}
                {matchingFolders.length > 0 && (
                  <div className="py-2.5">
                    <h4 className="px-3 text-[9.5px] font-mono tracking-widest uppercase font-bold text-emerald-600 mb-1">
                      Dossiers GED ({matchingFolders.length})
                    </h4>
                    <div className="space-y-px">
                      {matchingFolders.map(f => (
                        <button
                          key={f.id}
                          onClick={() => {
                            if (onInstantSelectResult) onInstantSelectResult("folder", f.id);
                            setSearchValue("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-2.5 text-slate-755 font-semibold cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icons.Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="truncate text-slate-805 font-bold">{f.name}</span>
                          </div>
                          <span className="text-[10px] bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded font-mono text-slate-500 shrink-0 uppercase">
                            {f.type.replace("DOSSIER_", "")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group 3: Documents */}
                {matchingDocs.length > 0 && (
                  <div className="py-2.5">
                    <h4 className="px-3 text-[9.5px] font-mono tracking-widest uppercase font-bold text-amber-600 mb-1">
                      Pièces & Justificatifs ({matchingDocs.length})
                    </h4>
                    <div className="space-y-px">
                      {matchingDocs.map(d => (
                        <button
                          key={d.id}
                          onClick={() => {
                            if (onInstantSelectResult) onInstantSelectResult("document", d.id);
                            setSearchValue("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-2.5 font-semibold cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icons.FileText className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="truncate text-slate-805 font-bold">{d.originalFileName}</span>
                          </div>
                          <span className="font-mono text-[9.5px] text-slate-400 shrink-0">
                            {(d.fileSize / 1000000).toFixed(2)} MB
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {totalResultsCount === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <Icons.Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-705">Aucun résultat trouvé</p>
                    <p className="text-[10px] text-slate-450 mt-1 max-w-[250px] mx-auto leading-relaxed">
                      Aucune pièce accessible pour "{searchValue}" proportionnellement à votre rôle ({userRole}).
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right compliance & profile details */}
      <div className="flex items-center justify-end gap-3.5 lg:w-[30%] shrink-0">
        
        {/* Supervision key toggle based on role permissions */}
        {isAuthorizedForSupervision && onToggleVoirTout && (
          <button
            onClick={() => onToggleVoirTout(!voirToutActive)}
            className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-bold text-[9.5px] select-none ${
              voirToutActive
                ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
            title="S'affranchir temporairement du cloisonnement local d'agence"
          >
            <Icons.Eye className="w-3.5 h-3.5" />
            <span className="truncate">SUPERVISION : {voirToutActive ? "active" : "OFF"}</span>
          </button>
        )}

        {/* Notifications and swaps */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationCenter(!showNotificationCenter)}
            className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl relative hover:bg-slate-100 transition-all cursor-pointer text-slate-600 shrink-0"
            aria-label="Alertes"
          >
            <Icons.Bell className="w-4.5 h-4.5" />
            {filteredNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#FF3B30] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {filteredNotifications.length}
              </span>
            )}
          </button>

          {showNotificationCenter && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotificationCenter(false)} />
              <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 p-4.5 animate-slide-up font-sans text-xs text-slate-700">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                  <span className="font-extrabold text-slate-800">Alertes réglementaires</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-450">COBAC</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 font-mono text-[10px]">Aucune nouvelle alerte.</p>
                  ) : (
                    filteredNotifications.map((notif, index) => (
                      <div key={index} className="py-3 flex gap-2.5 items-start">
                        <div className="p-1 px-1.5 bg-red-400/10 text-red-500 rounded font-mono text-[8px] tracking-wider uppercase font-extrabold shrink-0 mt-0.5">
                          {notif.type}
                        </div>
                        <div>
                          <p className="font-bold text-slate-805 leading-normal">{notif.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">{notif.desc}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Identity swap / selection control */}
        <div className="relative">
          <button
            onClick={() => {
              setShowIdentityMenu(!showIdentityMenu);
              setShowNotificationCenter(false);
            }}
            className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all cursor-pointer text-slate-600"
            title="Changer de compte d'accréditation"
          >
            <Icons.UserCog className="w-4.5 h-4.5" />
          </button>

          {showIdentityMenu && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowIdentityMenu(false)} />
              <div className="absolute right-0 mt-3.5 w-72 bg-white border border-slate-150 rounded-2xl shadow-xl z-55 overflow-hidden pb-1 animate-slide-up">
                <div className="px-4.5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider font-mono">Démonstrateur d'Habilitations</span>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                    Permutez instantanément pour tester d'autres profils et isolations locales.
                  </p>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {availableUsers.length > 0 && onChangeUser ? availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onChangeUser(u.id);
                        setShowIdentityMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-all cursor-pointer ${currentUser?.id === u.id ? "bg-slate-50/85 font-black" : ""}`}
                    >
                      <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 leading-none truncate">{u.fullName}</p>
                        <p className="text-[9px] text-[#0052CC] font-bold font-mono mt-1.5 uppercase tracking-wider">{u.roleName}</p>
                      </div>
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-[10px] text-slate-400">Connectez-vous pour accéder à votre profil.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <UserMenu
          currentUser={currentUser}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
        />

      </div>

    </nav>
  );
}
