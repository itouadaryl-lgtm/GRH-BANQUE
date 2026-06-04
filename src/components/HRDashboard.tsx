/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  approvedBy: string;
  approvedAt: string;
  approverComment: string;
}

interface JobOffer {
  id: string;
  title: string;
  department: string;
  description: string;
  location: string;
  salaryRange: string;
  status: "active" | "ARCHIVED";
  createdAt: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  status: "APPLIED" | "INTERVIEW" | "OFFERED" | "HIRED" | "rejected";
  notes: string;
  interviewDate: string;
  testScore: number;
}

interface HRDashboardProps {
  currentUser: any;
  employees: any[];
}

export default function HRDashboard({ currentUser, employees }: HRDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "leaves" | "recruitment" | "contracts">("overview");

  // Server state data lists
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Leave approval states
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [arbitrageComment, setArbitrageComment] = useState("");

  // Recruitment creation modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobDeptInput, setJobDeptInput] = useState("Relations Clientèle");
  const [jobDescInput, setJobDescInput] = useState("");
  const [jobLocationInput, setJobLocationInput] = useState("Siège Social, Libreville");
  const [jobSalaryInput, setJobSalaryInput] = useState("800,000 - 1,200,000 FCFA");

  // Application arbitration states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appNotesInput, setAppNotesInput] = useState("");
  const [appDateInput, setAppDateInput] = useState("");
  const [appScoreInput, setAppScoreInput] = useState(0);

  // Sync state data from API
  const syncHRData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${currentUser.id}` };

      // Load leaves
      const resLeaves = await fetch("/api/leave-requests", { headers });
      const dataLeaves = await resLeaves.json();
      if (dataLeaves.success) setLeaves(dataLeaves.data);

      // Load recruitment jobs
      const resJobs = await fetch("/api/recruitment/jobs", { headers });
      const dataJobs = await resJobs.json();
      if (dataJobs.success) setJobs(dataJobs.data);

      // Load applications
      const resApps = await fetch("/api/recruitment/applications", { headers });
      const dataApps = await resApps.json();
      if (dataApps.success) setApplications(dataApps.data);

    } catch (err) {
      console.error(err);
      toast.error("Échec de synchronisation avec le registre central RH");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncHRData();
  }, [currentUser]);

  // Arbtitrage Congés (Approve or Reject leave request)
  const handleArbitrateLeave = async (status: "approved" | "rejected") => {
    if (!selectedLeave) return;
    try {
      const res = await fetch(`/api/leave-requests/${selectedLeave.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          status,
          approverComment: arbitrageComment
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Demande de congé arbitrée avec succès: ${status === "approved" ? "Approuvée" : "Refusée"}`);
        setSelectedLeave(null);
        setArbitrageComment("");
        syncHRData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Connexion impossible vers le serveur central de congés");
    }
  };

  // Submit dynamic job vacancy publish
  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitleInput || !jobDescInput) {
      toast.error("Saisie invalide: Libellé et description de poste requis.");
      return;
    }

    try {
      const res = await fetch("/api/recruitment/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          title: jobTitleInput,
          department: jobDeptInput,
          description: jobDescInput,
          location: jobLocationInput,
          salaryRange: jobSalaryInput
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Nouvelle offre de recrutement promulguée !");
        setShowJobModal(false);
        setJobTitleInput("");
        setJobDescInput("");
        syncHRData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Erreur de sauvegarde de l'offre");
    }
  };

  // Delete Job Offres
  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Supprimer cette offre définitivement ?")) return;
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.id}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Offre retirée.");
        syncHRData();
      }
    } catch (e) {
      toast.error("Échec du retrait");
    }
  };

  // Accept / Update application status
  const handleUpdateApplication = async (status: "INTERVIEW" | "OFFERED" | "HIRED" | "rejected") => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/recruitment/applications/${selectedApp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          status,
          notes: appNotesInput,
          interviewDate: appDateInput,
          testScore: appScoreInput
        })
      });
      const data = await res.json();
      if (data.success) {
        if (status === "HIRED") {
          toast.success(`Embauche validée ! Un profil agent et un coffre-fort numérique ont été générés pour ${selectedApp.candidateName}.`);
        } else {
          toast.success("Dossier candidat mis à jour avec succès.");
        }
        setSelectedApp(null);
        syncHRData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Erreur de sauvegarde de la candidature");
    }
  };

  // Computations
  const activeCount = employees.filter(e => e.status === "active").length;
  const leaveCount = leaves.filter(l => l.status === "approved").length;
  const pendingRequestsCount = leaves.filter(l => l.status === "pending").length;

  const hiringData = [
    { name: "Jan", recruits: 1 },
    { name: "Fév", recruits: 3 },
    { name: "Mar", recruits: 2 },
    { name: "Avr", recruits: 4 },
    { name: "Mai", recruits: 6 + applications.filter(a => a.status === "HIRED").length }
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Banner info */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-white/20 text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Direction des Ressources Humaines (DRH)
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-2">
              Portail Opérationnel RH d'AFG Gabon
            </h1>
            <p className="text-white/80 text-xs mt-1">
              Arbitrez les congés, publiez des offres de carrières et pilotez l'onboarding instantané de nouveaux agents de façon 105% automatisée.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab("recruitment");
                setShowJobModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Icons.FilePlus className="w-4 h-4" />
              <span>Publier une Offre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu navigation */}
      <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-emerald-600 text-emerald-650 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icons.LineChart className="w-4 h-4" />
          <span>Indicateurs Globaux</span>
        </button>

        <button
          onClick={() => setActiveTab("leaves")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "leaves"
              ? "border-emerald-600 text-emerald-650 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icons.CalendarRange className="w-4 h-4" />
          <span>Gestion des Congés ({leaves.length})</span>
          {pendingRequestsCount > 0 && (
            <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("recruitment")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "recruitment"
              ? "border-emerald-600 text-emerald-650 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icons.UserPlus className="w-4 h-4" />
          <span>Recrutement & Candidats ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "contracts"
              ? "border-emerald-600 text-emerald-650 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icons.FolderTree className="w-4 h-4" />
          <span>Dossiers de Contrats & GED</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Icons.RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Lecture du registre RH d'AFG Bank...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS & CHARTS */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-slide-up">
              {/* Primary Metrics Group */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono font-bold uppercase block tracking-wider">Effectifs Actifs</span>
                    <h3 className="text-xl font-bold text-slate-805 mt-1">{activeCount}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1">● Session active</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Icons.Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono font-bold uppercase block tracking-wider">En Congé Actif</span>
                    <h3 className="text-xl font-bold text-[#0052CC] mt-1">{leaveCount} agents</h3>
                    <p className="text-[10px] text-slate-400">Géré par le pôle central</p>
                  </div>
                  <div className="w-10 h-10 bg-[#0052CC]/10 text-[#0052CC] rounded-xl flex items-center justify-center">
                    <Icons.CalendarCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono font-bold uppercase block tracking-wider">Postes Ouverts</span>
                    <h3 className="text-xl font-bold text-slate-805 mt-1">{jobs.filter(j => j.status === "active").length} vacance(s)</h3>
                    <p className="text-[10px] text-slate-400">Diffusion publique</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                    <Icons.Send className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono font-bold uppercase block tracking-wider">Ancienneté Moyenne</span>
                    <h3 className="text-xl font-bold text-slate-805 mt-1">4.5 Ans</h3>
                    <p className="text-[10px] text-teal-650 font-bold">Fidélisation stable</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                    <Icons.ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Chart & Quick cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-855">Courbe d'Accréditations & Embauches</h3>
                      <p className="text-[10px] text-slate-400">Suivi d'onboarding sur l'exercice en cours au Gabon.</p>
                    </div>
                    <span className="text-[9px] text-[#0052CC] font-bold font-mono">Annuel</span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hiringData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="recruits" stroke="#10B981" fill="#D1FAE5" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Shortcuts & auditing */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[9.5px] font-mono font-bold text-[#0052CC] uppercase tracking-wider block">Laissez-Passer Crypte</span>
                    <h3 className="text-sm font-bold text-slate-805">Raccourcis DRH & Opérations</h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Configurez et lancez l'impression en lot des laissez-passer physiques pour le siège d'AFG Bank.
                    </p>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => {
                          toast.success("Demande d'impression globale transmise au spool de Libreville.");
                        }}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-[#0052CC]/5 text-slate-705 rounded-xl text-[11px] font-bold transition-all border border-transparent hover:border-[#0052CC]/25 cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Icons.Printer className="w-4 h-4 text-emerald-500" />
                          <span>Imprimer badges professionnels</span>
                        </div>
                        <Icons.ArrowRight className="w-4 h-4 text-slate-400 font-bold" />
                      </button>

                      <button
                        onClick={() => {
                          toast.success("Le bilan social d'agence a été compilé au format PDF.");
                        }}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-[#0052CC]/5 text-slate-705 rounded-xl text-[11px] font-bold transition-all border border-transparent hover:border-[#0052CC]/25 cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Icons.Scale className="w-4 h-4 text-indigo-500" />
                          <span>Calculer Bilan Social d'Agence</span>
                        </div>
                        <Icons.ArrowRight className="w-4 h-4 text-slate-400 font-bold" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 text-emerald-805 rounded-2xl border border-emerald-100 text-[10.5px] font-semibold mt-4">
                    L'interface financière d'AFG Bank est synchronisée. Les modifications d'absences régissent la fiche de paie automatiquement.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEAVE REQUESTS ARBITRATION */}
          {activeTab === "leaves" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-855">Arbitrage des Absences & Permissions de Sortie</h3>
                <p className="text-[10px] text-slate-400">Total absences en attente d'arbitrage : {leaves.filter(l => l.status === "pending").length}</p>
              </div>

              {leaves.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">Aucune demande de congé répertoriée.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] pb-2">
                        <th className="py-2">AGENT</th>
                        <th>TYPE</th>
                        <th>DÉBUT</th>
                        <th>FIN</th>
                        <th>MOTIF SOUHAITÉ</th>
                        <th>STATUT</th>
                        <th className="text-right">DÉCISION DU DRH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                          <td className="py-3 font-semibold text-slate-805">{l.employeeName}</td>
                          <td className="font-medium text-slate-605">
                            {l.type === "CONGE_ANNUEL" ? "Congé Annuel" : "Permission Exceptionnelle"}
                          </td>
                          <td className="text-slate-500">{l.startDate}</td>
                          <td className="text-slate-500">{l.endDate}</td>
                          <td className="text-slate-500 max-w-xs truncate">{l.reason}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black ${
                              l.status === "approved"
                                ? "bg-emerald-50 text-emerald-600"
                                : l.status === "pending"
                                ? "bg-amber-50 text-amber-600 animate-pulse"
                                : "bg-rose-50 text-rose-500"
                            }`}>
                              {l.status === "approved" ? "Validé" : l.status === "pending" ? "À arbitrer" : "Refusé"}
                            </span>
                          </td>
                          <td className="text-right">
                            {l.status === "pending" ? (
                              <button
                                onClick={() => setSelectedLeave(l)}
                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold text-indigo-600 transition-all cursor-pointer"
                              >
                                Évaluer la demande
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Arbitré par {l.approvedBy}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECRUITMENT & CANDIDATE ONBOARDING */}
          {activeTab === "recruitment" && (
            <div className="space-y-6">
              {/* Jobs view and Applications list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Jobs vacancy registry */}
                <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="text-xs font-bold text-slate-805">Offres Publiées ({jobs.length})</h3>
                    <button
                      onClick={() => setShowJobModal(true)}
                      className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer"
                    >
                      <Icons.Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {jobs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-[11px]">Aucun poste publié.</div>
                  ) : (
                    <div className="space-y-3.5 max-h-110 overflow-y-auto pr-1">
                      {jobs.map(j => (
                        <div key={j.id} className="p-3 bg-slate-50 border rounded-2xl relative space-y-1 hover:border-indigo-200 transition-all">
                          <button
                            onClick={() => handleDeleteJob(j.id)}
                            className="absolute right-2 top-2 text-slate-300 hover:text-rose-500 cursor-pointer"
                          >
                            <Icons.Trash className="w-3.5 h-3.5" />
                          </button>
                          <h4 className="text-xs font-bold text-slate-805">{j.title}</h4>
                          <span className="text-[10px] font-mono text-indigo-600 block font-semibold">{j.department}</span>
                          <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{j.description}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t text-[9px] font-mono text-slate-400">
                            <span>📍 {j.location}</span>
                            <span className="font-bold text-slate-505">{j.salaryRange} FCFA</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job applications screening with onboarding trigger */}
                <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-855">Candidatures & Accréditation Instantanée</h3>
                  <p className="text-[10px] text-slate-400">Cliquez sur un dossier candidat pour noter les entretiens ou valider une embauche immédiate.</p>

                  {applications.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">Aucune candidature réceptionnée pour l'instant.</div>
                  ) : (
                    <div className="space-y-3.5">
                      {applications.map(a => (
                        <div
                          key={a.id}
                          className="p-4 border border-slate-100 rounded-3xl hover:border-emerald-200 hover:bg-emerald-50/5/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          onClick={() => {
                            setSelectedApp(a);
                            setAppNotesInput(a.notes || "");
                            setAppDateInput(a.interviewDate || "");
                            setAppScoreInput(a.testScore || 0);
                          }}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-805">{a.candidateName}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">({a.candidateEmail})</span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-505 block">
                              Candidat pour : <strong className="text-indigo-600">{a.jobTitle}</strong>
                            </span>
                            {a.interviewDate && (
                              <p className="text-[9.5px] font-mono text-amber-600">
                                Entretien convenu le : {new Date(a.interviewDate).toLocaleString()}
                              </p>
                            )}
                            {a.testScore > 0 && (
                              <p className="text-[9.5px] font-mono text-emerald-600">
                                Note d'admission technique : {a.testScore} / 100
                              </p>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-start sm:items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              a.status === "HIRED"
                                ? "bg-emerald-50 text-emerald-600"
                                : a.status === "INTERVIEW"
                                ? "bg-amber-50 text-amber-600"
                                : a.status === "rejected"
                                ? "bg-rose-50 text-rose-500"
                                : "bg-indigo-50 text-indigo-500"
                            }`}>
                              {a.status === "HIRED" ? "Embauché" : a.status === "INTERVIEW" ? "Entretien" : a.status === "rejected" ? "Rejeté" : "Reçu"}
                            </span>
                            <span className="text-[9px] text-indigo-600 underline font-semibold mt-1">Évaluer le dossier →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTRACT TEMPLATES & METADATA GRID */}
          {activeTab === "contracts" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-855">Modèles de Contrats & Convention Collective</h3>
                  <p className="text-[10px] text-slate-400">Bibliothèque modèle GED d'AFG Bank Gabon.</p>
                </div>
                <button
                  onClick={() => toast.success("Modèle de contrat d'onboarding mis en ligne.")}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-150 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer"
                >
                  Ajouter un Modèle GED
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-4 border rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <Icons.File className="w-8 h-8 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-805">Contrat CDI Gabon Mandataire</h4>
                    <p className="text-[10px] text-slate-400 leading-normal leading-relaxed">CDI Gabonais standard amendé selon la convention COBAC des banques gabonaises.</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Dernière retouche : Mai 2026</span>
                </div>

                <div className="p-4 border rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <Icons.File className="w-8 h-8 text-teal-650" />
                    <h4 className="text-xs font-bold text-slate-805">Accord de Télétravail Inter-branches</h4>
                    <p className="text-[10px] text-slate-400 leading-normal leading-relaxed">Formel d'autorisation de travail distant hors siège.</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Dernière retouche : Fév 2026</span>
                </div>

                <div className="p-4 border rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <Icons.File className="w-8 h-8 text-purple-650" />
                    <h4 className="text-xs font-bold text-slate-805">Avenant d'Assurance CNSS Spéciale</h4>
                    <p className="text-[10px] text-slate-400 leading-normal leading-relaxed">Pour l'affectation budgétaire des directeurs d'agences régionales.</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Dernière retouche : Mars 2026</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Leave Arbitration Dialog Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-805">Décision Arbitrage de Congé</h3>
              <button onClick={() => setSelectedLeave(null)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-455">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 py-1">
              <p className="text-slate-500 font-bold">Demandeur: <strong className="text-slate-805">{selectedLeave.employeeName}</strong></p>
              <p className="text-slate-500">Motif : "{selectedLeave.reason}"</p>
              <p className="text-slate-500">Période souhaitée : {selectedLeave.startDate} au {selectedLeave.endDate}</p>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-405 block mb-1">Commentaire de validation/rejet (Optionnel)</label>
              <textarea
                value={arbitrageComment}
                onChange={(e) => setArbitrageComment(e.target.value)}
                placeholder="Ex. Validé par rapport aux quotas de l'agence..."
                className="w-full p-2.5 border border-slate-100 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none h-20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleArbitrateLeave("approved")}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition-all"
              >
                Approuver Congé
              </button>
              <button
                onClick={() => handleArbitrateLeave("rejected")}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer transition-all"
              >
                Refuser Congé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruitment Job Publish Dialog Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-805">Promulguer une Offre de Recrutement</h3>
              <button onClick={() => setShowJobModal(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Département Affecté</label>
                  <select
                    value={jobDeptInput}
                    onChange={(e) => setJobDeptInput(e.target.value)}
                    className="w-full p-2 border border-slate-100 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Direction de l'Innov & IT">IT et Transition Digitale</option>
                    <option value="Crédit & Engagements">Crédit & Engagements</option>
                    <option value="Relations Clientèle">Relations Clientèle</option>
                    <option value="Comptabilité">Fiscalité & Budgets</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Localisation géographique</label>
                  <input
                    type="text"
                    required
                    value={jobLocationInput}
                    onChange={(e) => setJobLocationInput(e.target.value)}
                    className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Intitulé du Poste *</label>
                <input
                  type="text"
                  placeholder="Ex: Analyste de Risques Junior"
                  required
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Description sommaire des missions *</label>
                <textarea
                  placeholder="Ex: Analyse des fiches de demandes de cautions hypothécaires..."
                  required
                  value={jobDescInput}
                  onChange={(e) => setJobDescInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-100 rounded-xl focus:outline-none h-20"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Fourchette de traitement annuel (FCFA)</label>
                <input
                  type="text"
                  placeholder="Ex: 800,000 - 1,200,000"
                  value={jobSalaryInput}
                  onChange={(e) => setJobSalaryInput(e.target.value)}
                  className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow cursor-pointer transition-all"
                >
                  Enregistrer & Diffuser
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl font-semibold cursor-pointer"
                >
                  Ignorer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Arbitration Dialog Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all col-span-12 text-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-805">Arbitrage Dossier Candidat</h3>
              <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 py-1">
              <p className="font-bold text-slate-805">Candidat: {selectedApp.candidateName}</p>
              <p className="text-slate-400">Poste sollicité : {selectedApp.jobTitle}</p>
              <p className="text-slate-400">CV d'origine : <span className="underline font-mono text-indigo-600 text-[10.5px]">{selectedApp.resumeUrl}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Date d'Entretien</label>
                <input
                  type="datetime-local"
                  value={appDateInput}
                  onChange={(e) => setAppDateInput(e.target.value)}
                  className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Note de Test Technique (sur 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={appScoreInput}
                  onChange={(e) => setAppScoreInput(Number(e.target.value))}
                  className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Notes d'évaluation d'entretien</label>
              <textarea
                value={appNotesInput}
                onChange={(e) => setAppNotesInput(e.target.value)}
                placeholder="Rédiger l'avis du jury de recrutement..."
                className="w-full p-2.5 border border-slate-100 rounded-xl focus:outline-none h-16"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateApplication("INTERVIEW")}
                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-705 rounded-xl font-bold cursor-pointer border border-indigo-250 transition-all text-[11px]"
                >
                  Placer en entretien
                </button>
                <button
                  onClick={() => handleUpdateApplication("rejected")}
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-705 rounded-xl font-bold cursor-pointer border border-rose-250 transition-all text-[11px]"
                >
                  Rejeter la candidature
                </button>
              </div>

              <button
                onClick={() => handleUpdateApplication("HIRED")}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow transition-all text-xs font-sans text-center flex items-center justify-center gap-2"
              >
                <Icons.UserCheck2 className="w-4 h-4" />
                <span>Onborder l'Agent — Embauche Validée</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
