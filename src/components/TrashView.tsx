/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import * as Icons from "lucide-react";

interface TrashViewProps {
  deletedDocs: any[];
  employees: any[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export default function TrashView({ deletedDocs, employees, onRestore, onPermanentDelete, onEmptyTrash }: TrashViewProps) {
  return (
    <div className="space-y-6 animate-slide-up pb-12 font-sans text-xs font-semibold">
      
      {/* Title block */}
      <div className="pb-4 border-b border-slate-150 flex justify-between items-end">
        <div>
          <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Espace de Sécurité</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Corbeille de Rétention <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Trash</span></h1>
        </div>
        {deletedDocs.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="flex items-center gap-1.5 px-5 py-3 bg-red-50 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white text-xs font-bold rounded-full border border-red-200/55 transition-all cursor-pointer"
          >
            <Icons.Trash2 className="w-3.5 h-3.5" />
            Vider la corbeille
          </button>
        )}
      </div>

      {/* Rétention Policy Alert */}
      <div className="bg-amber-50 text-amber-800 border border-amber-200/60 rounded-3xl p-5 flex gap-4 text-xs leading-relaxed font-semibold">
        <Icons.AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block text-amber-900 mb-1">Politique de Rétention Active</span>
          La politique nationale de conformité pour les archives d'AFG BANK impose un délai de rétention de **30 jours**. Tout fichier logé dans la corbeille sera automatiquement purgé du serveur d'archivage physique au-delà de cette durée.
        </div>
      </div>

      {/* Soft deleted files list */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between">
          <span className="text-xs font-black text-slate-800">{deletedDocs.length} documents en cours de rétention</span>
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Purge planifiée à minuit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[#700px]">
            <thead className="bg-[#F8FAFC] uppercase text-[9px] font-extrabold tracking-widest text-slate-400 border-b border-slate-150">
              <tr>
                <th className="py-4 px-6">Nom du document</th>
                <th className="py-4 px-4">Supprimé par</th>
                <th className="py-4 px-4">Date de suppression</th>
                <th className="py-4 px-4">Rétention restante</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold bg-white text-slate-700">
              {deletedDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400 font-bold">
                    <Icons.Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    Aucun document en rétention. La corbeille est propre.
                  </td>
                </tr>
              ) : (
                deletedDocs.map((doc) => {
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                        <Icons.FileText className="w-4 h-4 text-[#0052CC]/60 shrink-0" />
                        {doc.originalFileName}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                          Aimé Mbili
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono">
                        {new Date(doc.deletedAt || "").toLocaleDateString("fr-FR")} {new Date(doc.deletedAt || "").toTimeString().substr(0, 5)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-red-50 text-[#FF3B30] border border-red-100 rounded-lg text-[10px] font-bold">
                          29 jours restants
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRestore(doc.id)}
                            className="px-3.5 py-2 bg-slate-50 hover:bg-[#0052CC] hover:text-white text-[#0052CC] font-bold border border-slate-200 rounded-xl text-[11.5px] transition-colors cursor-pointer"
                          >
                            Restaurer
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Action irréversible : voulez-vous supprimer définitivement "${doc.originalFileName}" des disques d'archivage d'AFG BANK ?`)) {
                                onPermanentDelete(doc.id);
                              }
                            }}
                            className="px-3.5 py-2 bg-red-50 hover:bg-[#FF3B30] hover:text-white text-[#FF3B30] font-bold border border-red-100 rounded-xl text-[11.5px] transition-all cursor-pointer"
                          >
                            Définitif
                          </button>
                        </div>
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
