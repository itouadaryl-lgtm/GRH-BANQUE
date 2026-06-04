/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";

interface DashboardViewProps {
  currentUser: any;
  stats: {
    totalDocs: number;
    activeEmployees: number;
    totalAgencies: number;
    totalFolders: number;
    pendingRequests: number;
    distribution: any[];
  } | null;
  recentLogs: any[];
  recentDocs: any[];
  onNavigateTab: (tab: string) => void;
}

export default function DashboardView({ currentUser, stats, recentLogs, recentDocs, onNavigateTab }: DashboardViewProps) {
  const [counts, setCounts] = useState({ docs: 0, employees: 0, folders: 0, pending: 0 });

  useEffect(() => {
    if (stats) {
      setCounts({
        docs: stats.totalDocs,
        employees: stats.activeEmployees,
        folders: stats.totalFolders,
        pending: stats.pendingRequests
      });
    }
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Icons.Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Chargement des indicateurs financiers & RH d'AFG BANK...</p>
        </div>
      </div>
    );
  }

  // Bento metric cards with premium, high-fidelity light themes
  const cards = [
    { 
      title: "Documents Indexés", 
      value: counts.docs.toLocaleString("fr-FR"), 
      subText: "+14.2% ce trimestre", 
      icon: "Files", 
      color: "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]/10" 
    },
    { 
      title: "Collaborateurs RH", 
      value: counts.employees, 
      subText: "100% fiches à jour", 
      icon: "Users", 
      color: "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/10" 
    },
    { 
      title: "Dossiers Actifs", 
      value: counts.folders, 
      subText: "Sauvegarde chiffrée", 
      icon: "FolderClosed", 
      color: "bg-amber-500/10 text-amber-600 border-amber-500/10" 
    },
    { 
      title: "Demandes d'Accès", 
      value: counts.pending, 
      subText: "3 approbations requises", 
      icon: "KeyRound", 
      color: "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/10" 
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      
      {/* Welcome Banner mimicking Wealth Management Portal */}
      <div className="bg-gradient-to-r from-[#0052CC] to-[#0A84FF] p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_24px_rgba(0,82,204,0.15)] text-white">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
          <Icons.Building2 className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="px-3.5 py-1.5 bg-white/15 text-white border border-white/20 text-[9px] uppercase tracking-widest font-bold rounded-full font-mono">
            Système Central de Conservation - AFG BANK
          </span>
          <h2 className="text-3xl font-light tracking-tight text-white mt-1 leading-tight">
            Bienvenue, {currentUser?.fullName} <span className="text-white/50 font-normal">/</span> <span className="italic font-serif text-[#00C853] font-bold">Session Sécurisée</span>
          </h2>
          <p className="text-white/85 text-xs font-medium leading-relaxed">
            Cabinet de pilotage des archives numériques certifiées conformes aux réglementations bancaires nationales gabonaises. Rôle actif d'accès concédé : <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-white uppercase text-[10px] ml-1">{currentUser?.roleName}</span>.
          </p>
        </div>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const IconComponent = (Icons as any)[card.icon] || Icons.File;
          return (
            <div 
              key={idx} 
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-800">{card.value}</h3>
                <span className="text-[11px] text-[#00C853] font-bold flex items-center gap-1 mt-1 font-sans">
                  <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                  {card.subText}
                </span>
              </div>
              <div className={`p-4 rounded-2xl border ${card.color} transition-transform duration-305 group-hover:scale-105 shadow-sm`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph and Audit activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SVG Donut / Segment chart + table stats */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Répartition Documentaire</h3>
            <span className="text-[9.5px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono font-bold uppercase">ISO 27001</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
            {/* Vector Donut graph for the light theme */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track in light slate gray */}
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {/* Slice 1: Contracts 35% */}
                <circle cx="50" cy="50" r="40" stroke="#0052CC" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="87.9" strokeLinecap="round" fill="transparent" />
                {/* Slice 2: Pay slips 25% */}
                <circle cx="50" cy="50" r="40" stroke="#0A84FF" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="150.7" fill="transparent" transform="rotate(126, 50, 50)" />
                {/* Slice 3: Certs 15% */}
                <circle cx="50" cy="50" r="40" stroke="#ffd60a" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="213.5" fill="transparent" transform="rotate(216, 50, 50)" />
                {/* Slice 4: Social 15% */}
                <circle cx="50" cy="50" r="40" stroke="#00C853" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="213.5" fill="transparent" transform="rotate(270, 50, 50)" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 leading-none">1 248</span>
                <span className="text-[8px] text-slate-400 font-mono tracking-widest mt-1.5 uppercase font-bold">Pièces GED</span>
              </div>
            </div>

            {/* Legends list with custom light theme colors */}
            <div className="space-y-2.5 w-full text-xs text-slate-600">
              {stats.distribution.map((item, idx) => {
                const colors = ["bg-[#0052CC]", "bg-[#0A84FF]", "bg-yellow-400", "bg-[#00C853]", "bg-slate-400"];
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                      <span className="text-slate-600 truncate max-w-[130px] font-semibold">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-slate-800 font-bold">{item.percent}%</span>
                      <span className="text-slate-400">({item.count})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent activity ticks */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50 shrink-0">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Activités Récentes</h3>
            <button
              onClick={() => onNavigateTab("activity-logs")}
              className="text-[11px] text-[#0052CC] hover:text-[#0066FF] font-bold underline underline-offset-4 cursor-pointer"
            >
              Parcourir le Registre d'Audit
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-60 pr-1">
            {recentLogs.slice(0, 4).map((log, idx) => {
              const colorBlock = 
                log.action === "UPLOAD" ? "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]/10" :
                log.action === "DELETE" ? "bg-red-50 text-[#FF3B30] border-red-100" : "bg-slate-50 text-slate-600 border-slate-200/80";

              return (
                <div key={log.id || idx} className="flex items-start gap-4 text-xs leading-normal pb-4 border-b border-slate-50 last:border-0">
                  <div className={`p-2.5 rounded-xl border ${colorBlock} shrink-0 mt-0.5`}>
                    {log.action === "UPLOAD" ? <Icons.UploadCloud className="w-4 h-4" /> :
                     log.action === "DELETE" ? <Icons.Trash className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium">
                      Document <span className="font-bold text-slate-800">"{log.entityLabel}"</span> {log.action === "UPLOAD" ? "téléversé et coffré" : log.action === "DELETE" ? "mis en corbeille" : "consulté"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-semibold">
                      <span>Par {log.userFullName}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-450">{new Date(log.timestamp).toLocaleDateString("fr-FR")} {new Date(log.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recents documents table */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Derniers Versement d'archives</h3>
          <button
            onClick={() => onNavigateTab("documents")}
            className="text-[11px] text-[#0052CC] hover:text-[#0066FF] font-bold underline underline-offset-4 cursor-pointer"
          >
            Explorer la Bibliothèque GED
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[#700px]">
            <thead>
              <tr className="bg-slate-50 uppercase text-[9px] font-bold tracking-widest text-[#71717a] border-b border-slate-100">
                <th className="py-3.5 px-6">Nom du document</th>
                <th className="py-3.5 px-4">Type d'Archive</th>
                <th className="py-3.5 px-4">Département RH</th>
                <th className="py-3.5 px-4">Collaborateur Cible</th>
                <th className="py-3.5 px-4">Date de dépôt</th>
                <th className="py-3.5 px-5">Taille</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 bg-white">
              {recentDocs.slice(0, 5).map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="py-4 px-6 text-slate-900 font-bold flex items-center gap-3">
                    <Icons.File className="w-4.5 h-4.5 text-[#0052CC]" />
                    {doc.originalFileName}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[9.5px] uppercase font-bold border border-slate-200/50 font-mono">
                      {doc.mimeType?.split("/")[1]?.toUpperCase() || "PDF"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium font-sans">Ressources Humaines</td>
                  <td className="py-4 px-4 text-slate-800 font-bold">Aimé Mbili</td>
                  <td className="py-4 px-4 text-slate-450 font-mono">
                    {new Date(doc.uploadDate).toLocaleDateString("fr-FR")} {new Date(doc.uploadDate).toTimeString().substr(0,5)}
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-500">
                    {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
