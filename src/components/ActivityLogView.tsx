/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { ActivityLog } from "../types";

interface ActivityLogViewProps {
  logs: ActivityLog[];
  employees: any[];
}

export default function ActivityLogView({ logs, employees }: ActivityLogViewProps) {
  const [selectedUser, setSelectedUser] = useState("");

  const filteredLogs = logs.filter(log => {
    return !selectedUser || log.userId === selectedUser;
  });

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* View Header */}
      <div className="pb-4 border-b border-slate-150">
        <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Audit & Traçabilité</p>
        <h1 className="text-3xl font-light tracking-tight text-slate-900">Journal d'activités securisé <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Audit</span></h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans text-slate-500">
          Traçabilité absolue : chaque action (lecture, suppression, téléchargement, connexion, création de badge) effectuée sur les archives d'AFG Bank Gabon est horodatée, cryptée et protégée de toute altération.
        </p>
      </div>

      {/* Filter Selector block in clean luxurious layout */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_22px_rgba(0,0,0,0.01)] flex items-center justify-between text-xs">
        <div className="w-72">
          <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 font-bold text-[9px]">Aiguiller par Collaborateur</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#0052CC] focus:bg-white"
          >
            <option value="">Tous les utilisateurs</option>
            {employees.map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>
        <span className="text-[10px] bg-slate-100/80 border border-slate-200/50 px-3.5 py-2 rounded-xl text-slate-600 font-bold font-mono h-fit">
          {filteredLogs.length} actions tracées
        </span>
      </div>

      {/* Logs activities table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-650 min-w-[#700px]">
            <thead className="bg-slate-50 uppercase text-[9px] font-bold tracking-widest text-[#71717a] border-b border-slate-150">
              <tr>
                <th className="py-3.5 px-6">Utilisateur</th>
                <th className="py-3.5 px-4">Action Sécurisée</th>
                <th className="py-3.5 px-4">Cible / Objet</th>
                <th className="py-3.5 px-4">Date et Heure locale</th>
                <th className="py-3.5 px-6">Adresse IP Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-450 bg-white">
                    <Icons.ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Aucun log de sécurité disponible dans le registre d'audit local.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-900 font-bold flex items-center gap-3">
                        <img
                          src={log.userPhotoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span>{log.userFullName}</span>
                          <span className="text-[8.5px] font-bold text-slate-450 uppercase block font-mono mt-0.5">{log.userRoleName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-805">
                        <span className="inline-flex items-center gap-1.5">
                          <Icons.Activity className="w-3.5 h-3.5 text-[#0052CC]" />
                          {log.action === "CONSULT" && "Consultation de document"}
                          {log.action === "UPLOAD" && "Dépôt de document"}
                          {log.action === "DELETE" && "Mise en corbeille administrative"}
                          {log.action === "RESTORE" && "Restauration d'archive"}
                          {log.action === "LOGIN" && "Connexion au portail banque"}
                          {log.action === "CARD_GENERATE" && "Délivrance de Carte Pro"}
                          {log.action === "PERM_DELETE" && "Purge définitive d'archive cryptée"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-semibold truncate max-w-[170px]" title={log.entityLabel}>
                        {log.entityLabel}
                      </td>
                      <td className="py-4 px-4 text-slate-450 font-mono">
                        {new Date(log.timestamp).toLocaleDateString("fr-FR")} {new Date(log.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-450">
                        {log.ipAddress || "192.168.10.15"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
