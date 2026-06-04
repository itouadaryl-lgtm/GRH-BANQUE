/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardProps {
  currentUser: any;
  employees: any[];
  documents: any[];
  agencies: any[];
}

export default function SuperAdminDashboard({ currentUser, employees, documents, agencies }: DashboardProps) {
  // Mock monthly system utilization chart
  const uploadStats = [
    { month: "Jan", uploads: 120, logins: 450, errorRate: 0.1 },
    { month: "Fév", uploads: 210, logins: 580, errorRate: 0.05 },
    { month: "Mar", uploads: 180, logins: 610, errorRate: 0.12 },
    { month: "Avr", uploads: 320, logins: 890, errorRate: 0.02 },
    { month: "Mai", uploads: 440, logins: 1240, errorRate: 0.04 }
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Upper banner section */}
      <div className="bg-gradient-to-r from-[#0B1E3F] to-[#0052CC] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-emerald-400 text-slate-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
              Superviseur Général Activé
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-2">
              Console de Contrôle Globale — Cabinet DG
            </h1>
            <p className="text-white/70 text-xs mt-1">
              Vue complète sur toutes les agences, registres d’indexation et habilitations réglementaires d'AFG Gabon.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 font-mono text-center text-xs">
            <span className="text-white/60 text-[9px] block">SYSTÈME CRITRIQUE STATUS</span>
            <span className="text-emerald-400 font-bold block mt-0.5">● 100% OPÉRATIONNEL</span>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics - 4 widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Effectif National</span>
            <div className="w-8 h-8 rounded-xl bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center">
              <Icons.Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">{employees.length}</h3>
            <p className="text-slate-400 text-[10px] font-medium mt-1">Collaborateurs inscrits</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">GED d'AFG Gabon</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Icons.FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">{documents.length}</h3>
            <p className="text-slate-400 text-[10px] font-medium mt-1">Documents indexés éligibles</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Couverture Réseau</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Icons.Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">{agencies.length}</h3>
            <p className="text-slate-400 text-[10px] font-medium mt-1">Agences physiques connectées</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Intégrité Serveurs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Icons.Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">99.98%</h3>
            <p className="text-slate-400 text-[10px] font-medium mt-1">Temps de réponse 45ms</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Actions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* uploads charts */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-805">Vitesse d'Indexation & Activité Globale</h3>
              <p className="text-[10px] text-slate-400">Croissance du volume d'archives de la Banque.</p>
            </div>
            <span className="text-[10px] font-mono text-[#0052CC] font-bold">5 derniers mois</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uploadStats}>
                <defs>
                  <linearGradient id="uploadsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="uploads" stroke="#0052CC" strokeWidth={2} fillOpacity={1} fill="url(#uploadsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortcuts for Super Admin */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-805">Raccourcis Habilitations Nationales</h3>
            <p className="text-slate-400 text-[10px]">Actions prioritaires directes réservées au Cabinet DG.</p>

            <div className="space-y-2.5">
              <button onClick={() => alert("Impression du rapport consolidé de conformité COBAC émise.")} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-[#0052CC]/5 text-slate-700 hover:text-[#0052CC] rounded-2xl text-[11px] font-bold transition-all border border-transparent hover:border-[#0052CC]/15 cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <Icons.FileSpreadsheet className="w-4 h-4 text-[#0052CC]" />
                  <span>Rapport Conformité COBAC</span>
                </div>
                <Icons.Sparkles className="w-4 h-4" />
              </button>
              
              <button onClick={() => alert("Simulation d'un archivage à froid d'archives de l'exercice 2020 lancer.")} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-[#0052CC]/5 text-slate-700 hover:text-[#0052CC] rounded-2xl text-[11px] font-bold transition-all border border-transparent hover:border-[#0052CC]/15 cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <Icons.PackageOpen className="w-4 h-4 text-violet-500" />
                  <span>Archivage à froid global</span>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button onClick={() => alert("Audit d'identité des 3 agents directeurs agences en cours d'authentification...")} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-[#0052CC]/5 text-slate-700 hover:text-[#0052CC] rounded-2xl text-[11px] font-bold transition-all border border-transparent hover:border-[#0052CC]/15 cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <Icons.ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Vérification d'Identités de l'Agence</span>
                </div>
                <Icons.UserCheck2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#0052CC]/5 p-3 rounded-2xl border border-[#0052CC]/10 mt-4">
            <span className="text-[8.5px] font-mono font-bold text-[#0052CC] uppercase tracking-wider block">CONSEIL SÉCURITÉ</span>
            <p className="text-[10px] text-slate-550 leading-relaxed mt-0.5 font-semibold">
              Veuillez purger le cache de connexions LDAP à l'agence des mines chaque fin de semaine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
