/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { Role } from "../types";
import { toast } from "sonner";

interface RolesPermissionsViewProps {
  roles: Role[];
  onSaveRolePermissions: (roleId: string, permissions: string[]) => void;
  onCreateRole?: (roleName: string, description: string) => Promise<any>;
  onDeleteRole?: (roleId: string) => Promise<any>;
}

export default function RolesPermissionsView({
  roles,
  onSaveRolePermissions,
  onCreateRole,
  onDeleteRole
}: RolesPermissionsViewProps) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const activeRoleId = selectedRoleId || (roles[0]?.id || "");
  const currentRole = roles.find(r => r.id === activeRoleId) || roles[0];

  const permissionModules = [
    { title: "Profils Coeurs / Utilisateurs", prefix: "USER", read: "USER_READ", write: "USER_CREATE", edit: "USER_UPDATE", delete: "" },
    { title: "Attribution des Habilitations", prefix: "ROLE", read: "", write: "ROLE_ASSIGN", edit: "", delete: "" },
    { title: "Documents GED d'AFG", prefix: "DOCUMENT", read: "DOCUMENT_READ", write: "DOCUMENT_CREATE", edit: "DOCUMENT_UPDATE", delete: "DOCUMENT_DELETE" },
    { title: "Employés & Collaborateurs", prefix: "EMPLOYEE", read: "EMPLOYEE_READ", write: "EMPLOYEE_CREATE", edit: "EMPLOYEE_UPDATE", delete: "EMPLOYEE_DELETE" },
    { title: "Consultation Réseau Agences", prefix: "AGENCY", read: "AGENCY_VIEW", write: "AGENCY_VIEW_ALL", edit: "", delete: "" },
    { title: "Génération de Cartes Sûres", prefix: "CARD", read: "", write: "CARD_GENERATE", edit: "", delete: "" },
    { title: "Assistant Virtuel IA (ARHI)", prefix: "CHATBOT", read: "CHATBOT_ACCESS", write: "", edit: "", delete: "" },
    { title: "Demandes de Décloisonnement", prefix: "ACCESS", read: "ACCESS_REQUEST_READ", write: "ACCESS_REQUEST_CREATE", edit: "ACCESS_REQUEST_APPROVE", delete: "ACCESS_REQUEST_REJECT" },
    { title: "Registre d'Intégrité Audit", prefix: "AUDIT", read: "AUDIT_LOG_READ", write: "AUDIT_LOG_EXPORT", edit: "", delete: "" },
    { title: "Corbeille Temporelle", prefix: "TRASH", read: "DOCUMENT_READ", write: "DOCUMENT_RESTORE", edit: "", delete: "DOCUMENT_DELETE" }
  ];

  const handleCheckboxChange = (permCode: string, checked: boolean) => {
    if (!permCode || !currentRole) return;
    
    let updatedPermissions = [...currentRole.permissions];
    if (checked) {
      if (!updatedPermissions.includes(permCode)) {
        updatedPermissions.push(permCode);
      }
    } else {
      updatedPermissions = updatedPermissions.filter(p => p !== permCode);
    }

    onSaveRolePermissions(currentRole.id, updatedPermissions);
  };

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toUpperCase();
    if (name.includes("ADMIN")) return <Icons.ShieldAlert className="w-8 h-8 text-[#0052CC]" />;
    if (name.includes("RH") || name.includes("MANAGER")) return <Icons.Users className="w-8 h-8 text-[#00C853]" />;
    return <Icons.ScanFace className="w-8 h-8 text-amber-500" />;
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error("Veuillez saisir un code identifiant unique de rôle.");
      return;
    }
    setIsSubmitting(true);
    try {
      const sanitizedName = newRoleName.trim().toUpperCase().replace(/\s+/g, "_");
      if (onCreateRole) {
        await onCreateRole(sanitizedName, newRoleDesc);
        toast.success(`Le rôle d'habilitation ${sanitizedName} a été créé !`);
        setNewRoleName("");
        setNewRoleDesc("");
        setShowAddModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la création du rôle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!deletingRoleId) return;
    try {
      if (onDeleteRole) {
        await onDeleteRole(deletingRoleId);
        toast.success("Rôle d'accessibilité révoqué définitivement.");
        if (selectedRoleId === deletingRoleId) {
          setSelectedRoleId("");
        }
        setDeletingRoleId(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Échec de suppression.");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12 font-sans text-xs font-semibold relative">
      
      {/* Title block */}
      <div className="pb-4 border-b border-slate-150 flex justify-between items-end">
        <div>
          <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Habilitations & Accréditations</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Matrice de Sécurité <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Rôles</span></h1>
          <p className="text-xs text-slate-500 mt-1">Gerez le dictionnaire des privilèges de consultation par échelon de responsabilité.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-white text-slate-800 border border-slate-200 text-xs font-bold rounded-full shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Icons.ShieldPlus className="w-4 h-4 text-[#0052CC]" />
          Nouveau rôle
        </button>
      </div>

      {/* Grid of existing assigned summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const isActive = role.id === activeRoleId;
          const isSystemRole = role.id === "role-super-admin" || role.id === "role-drh";
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`cursor-pointer border p-6 rounded-3xl shadow-sm transition-all relative overflow-hidden group flex items-center justify-between ${
                isActive 
                  ? "bg-white border-[#0052CC] ring-2 ring-[#0052CC]/10" 
                  : "bg-white border-slate-100 hover:border-slate-200 text-slate-800"
              }`}
            >
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#0052CC] uppercase tracking-widest font-mono">CODE: {role.name}</span>
                <h4 className="font-sans font-black text-slate-900 text-sm mt-0.5">{role.name.replace("ROLE_", "").replace("_", " ")}</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1">{role.permissions.length} privilèges configurés</p>
                <span className="text-[9px] text-slate-300 block italic max-w-[180px] font-medium leading-tight truncate">{role.description}</span>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="opacity-80">
                  {getRoleIcon(role.name)}
                </div>
                {!isSystemRole && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingRoleId(role.id);
                    }}
                    title="Supprimer ce rôle"
                    className="p-1 px-2 border border-red-200 text-red-500 rounded bg-red-50 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all text-[9px] font-bold cursor-pointer"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Checkbox Matrix Grid */}
      {currentRole && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-slide-up">
          
          <div className="p-6 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between">
            <div>
              <span className="text-sm font-black text-slate-805">Matrice d'Habilitations Active</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5">Configuration des accès du rôle : <span className="font-bold text-[#0052CC] uppercase tracking-widest font-mono ml-1">{currentRole.name.replace("ROLE_", "").replace("_", " ")}</span></p>
            </div>
            <span className="px-3 py-1 bg-[#0052CC]/10 text-[#0052CC] border border-[#0052CC]/15 text-[10px] font-bold tracking-widest uppercase rounded-lg font-mono">
              Mode : Édition Live
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[#600px]">
              <thead className="bg-[#F8FAFC] border-b border-slate-150 uppercase text-[9px] font-extrabold tracking-widest text-slate-400">
                <tr>
                  <th className="py-4 px-6 w-1/3">Module Applicatif</th>
                  <th className="py-4 px-4 text-center">Lect (Lecture)</th>
                  <th className="py-4 px-4 text-center">Ecrit (Création)</th>
                  <th className="py-4 px-4 text-center">Modif (Édition)</th>
                  <th className="py-4 px-4 text-center">Suppr (Suppression)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 bg-white">
                {permissionModules.map((modulo) => {
                  const isSuperAdmin = currentRole.name === "SUPER_ADMIN";
                  const hasRead = isSuperAdmin || (modulo.read ? currentRole.permissions.includes(modulo.read) || currentRole.permissions.includes("*") : false);
                  const hasWrite = isSuperAdmin || (modulo.write ? currentRole.permissions.includes(modulo.write) || currentRole.permissions.includes("*") : false);
                  const hasEdit = isSuperAdmin || (modulo.edit ? currentRole.permissions.includes(modulo.edit) || currentRole.permissions.includes("*") : false);
                  const hasDelete = isSuperAdmin || (modulo.delete ? currentRole.permissions.includes(modulo.delete) || currentRole.permissions.includes("*") : false);

                  return (
                    <tr key={modulo.title} className="hover:bg-slate-50/20 transition-colors">
                      <td className="py-4 px-6 text-slate-800 font-bold text-sm">
                        {modulo.title}
                      </td>

                      {/* READ */}
                      <td className="py-4 px-4 text-center">
                        {modulo.read ? (
                          <input
                            type="checkbox"
                            disabled={isSuperAdmin}
                            checked={hasRead}
                            onChange={(e) => handleCheckboxChange(modulo.read, e.target.checked)}
                            className="w-4.5 h-4.5 rounded text-[#0052CC] bg-slate-50 border-slate-300 focus:ring-0 cursor-pointer accent-[#0052CC]"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold font-mono">-</span>
                        )}
                      </td>

                      {/* WRITE */}
                      <td className="py-4 px-4 text-center">
                        {modulo.write ? (
                          <input
                            type="checkbox"
                            disabled={isSuperAdmin}
                            checked={hasWrite}
                            onChange={(e) => handleCheckboxChange(modulo.write, e.target.checked)}
                            className="w-4.5 h-4.5 rounded text-[#0052CC] bg-slate-50 border-slate-300 focus:ring-0 cursor-pointer accent-[#0052CC]"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold font-mono">-</span>
                        )}
                      </td>

                      {/* EDIT */}
                      <td className="py-4 px-4 text-center">
                        {modulo.edit ? (
                          <input
                            type="checkbox"
                            disabled={isSuperAdmin}
                            checked={hasEdit}
                            onChange={(e) => handleCheckboxChange(modulo.edit, e.target.checked)}
                            className="w-4.5 h-4.5 rounded text-[#0052CC] bg-slate-50 border-slate-300 focus:ring-0 cursor-pointer accent-[#0052CC]"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold font-mono">-</span>
                        )}
                      </td>

                      {/* DELETE */}
                      <td className="py-4 px-4 text-center">
                        {modulo.delete ? (
                          <input
                            type="checkbox"
                            disabled={isSuperAdmin}
                            checked={hasDelete}
                            onChange={(e) => handleCheckboxChange(modulo.delete, e.target.checked)}
                            className="w-4.5 h-4.5 rounded text-[#0052CC] bg-slate-50 border-slate-300 focus:ring-0 cursor-pointer accent-[#0052CC]"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold font-mono">-</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUPPRESSION DE RÔLE */}
      {deletingRoleId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 animate-slide-up">
            <h3 className="text-sm font-black text-slate-900">Confirmer la révocation du rôle ?</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Voulez-vous supprimer ce profil d'habilitation ? Les utilisateurs liés perdront leurs accès administratifs secondaires.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingRoleId(null)}
                className="px-4 py-2 border border-slate-200 rounded-full cursor-pointer text-slate-500 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteRoleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-full font-bold cursor-pointer hover:bg-red-500"
              >
                Révoquer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATION NOUVEAU ROLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 animate-slide-up border border-slate-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-black text-slate-805 flex items-center gap-2">
                <Icons.ShieldPlus className="w-5 h-5 text-[#0052CC]" /> Configure credentials
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-805 cursor-pointer">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Code du Rôle *</label>
                <input
                  required
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Ex : ROLE_AUDITOR_INTERNAL"
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl text-slate-705 font-bold uppercase focus:outline-none focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Description Fonctionnelle *</label>
                <textarea
                  required
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Ex : Agent d'audit central d'AFG avec autorisation de lecture seule..."
                  rows={3}
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl text-slate-705 font-medium focus:outline-none focus:bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 border border-slate-250 rounded-full cursor-pointer hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0066FF] disabled:bg-slate-400 text-white rounded-full font-bold cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Enregistrer le rôle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
