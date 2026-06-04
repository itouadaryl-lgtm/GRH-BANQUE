/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardProps {
  currentUser: any;
  employees: any[];
  documents: any[];
}

export default function AgencyAdminDashboard({ currentUser, employees, documents }: DashboardProps) {
  // Filter data localized to this active admin's agencyId!
  const userAgencyId = currentUser?.agencyId || "ag-libreville";
  const myEmployees = employees.filter(emp => emp.agencyId === userAgencyId);
  const myDocs = documents.filter(doc => doc.agencyId === userAgencyId || doc.folderId === userAgencyId);

  const localizedStats = [
    { type: "Contrats", count: myDocs.filter(d => d.fileName?.toLowerCase().includes("contrat")).length || 4 },
    { type: "Identités", count: myDocs.filter(d => d.fileName?.toLowerCase().includes("id") || d.fileName?.toLowerCase().includes("cni")).length || 7 },
    { type: "Diplômes", count: myDocs.filter(d => d.fileName?.toLowerCase().includes("diplome")).length || 3 },
    { type: "Rapports", count: myDocs.filter(d => d.fileName?.toLowerCase().includes("rapport")).length || 5 },
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Dynamic Branch Banner Header */}
      <div className="bg-gradient-to-r from-[#0E2856] to-[#0A84FF] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-emerald-400 text-slate-900 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
            Administrateur d'Agence Bindé
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            Direction d'Agence — {userAgencyId === "ag-siege" ? "Siège Libreville" : userAgencyId === "ag-portgentil" ? "Port-Gentil" : "Succursale Gabon Local"}
          </h1>
          <p className="text-white/80 text-xs mt-1">
            Gérez en sécurité les contrats locaux, cartes professionnelles de vos collaborateurs et archives rattachées.
          </p>
        </div>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[9.5px] font-mono font-bold uppercase block tracking-wider">Vos Collaborateurs</span>
            <h3 className="text-xl font-bold text-slate-805">{myEmployees.length} Agents</h3>
            <p className="text-slate-400 text-[9px]">Secteur Libreville & agence locale</p>
          </div>
          <div className="w-12 h-12 bg-[#0052CC]/10 text-[#0052CC] rounded-2xl flex items-center justify-center">
            <Icons.Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[9.5px] font-mono font-bold uppercase block tracking-wider">Archives Locales</span>
            <h3 className="text-xl font-bold text-slate-805">{myDocs.length || 12} Dossiers</h3>
            <p className="text-slate-400 text-[9px]">Enregistrements d'agence</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Icons.FolderArchive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[9.5px] font-mono font-bold uppercase block tracking-wider">Taux d'Accréditations</span>
            <h3 className="text-xl font-bold text-slate-805">100% Validé</h3>
            <p className="text-slate-400 text-[9px]">Conforme au règlement local</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Icons.Verified className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart and dynamic notifications list split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-805">Classification des Documents d'Agence</h3>
            <p className="text-slate-400 text-[10px]">Distribution typologique locale au format GED.</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localizedStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="type" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0052CC" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agency actions for HR Manager or Supervisor */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-805">Actions de l'Agence locales</h3>
            <p className="text-slate-400 text-[10px]">Tâches en attente d'évaluation.</p>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div className="flex gap-3">
                  <span className="w-5.5 h-5.5 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center shrink-0">
                    <Icons.FileText className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 leading-none">Contrat Paul Obiang</h4>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">En attente de cachet numérique</p>
                  </div>
                </div>
                <button onClick={() => alert("Indexation et cachet validés sur le fichier Paul Obiang.")} className="px-3 py-1 bg-[#0052CC] text-white hover:bg-[#0066FF] rounded-lg text-[9px] font-bold cursor-pointer">
                  Valider
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex gap-3">
                  <span className="w-5.5 h-5.5 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <Icons.ShieldAlert className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 leading-none">Visiteur d'Audit Centrale</h4>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Demande d'accès dictionnaire</p>
                  </div>
                </div>
                <button onClick={() => alert("Accès d'Audit accordé pour 24 heures.")} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-bold cursor-pointer">
                  Attribuer
                </button>
              </div>
            </div>
          </div>

          <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl space-y-1">
            <span className="text-[8.5px] font-mono font-bold text-[#0052CC]">RAPPORT DE TRAFIC SECTEUR-CENTRAL</span>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              Consultez le service comptable pour l'approbation de frais de déplacement d'agence Port-Gentil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
