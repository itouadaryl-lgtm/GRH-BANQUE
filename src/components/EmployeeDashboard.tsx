/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { toast } from "sonner";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  approvedBy: string;
  approverComment: string;
}

interface UserNotification {
  id: string;
  title: string;
  message: string;
  status: "READ" | "UNREAD";
  type: "SUCCESS" | "WARNING" | "INFO";
  createdAt: string;
}

interface EmployeeDashboardProps {
  currentUser: any;
}

export default function EmployeeDashboard({ currentUser }: EmployeeDashboardProps) {
  const [personalTasks, setPersonalTasks] = useState([
    { id: 1, text: "Envoyer le justificatif d'identité validé", status: "pending" },
    { id: 2, text: "Signer l'avenant de contrat informatique", status: "COMPLETED" },
    { id: 3, text: "Vérifier le matricule de badge d'accès physique", status: "pending" }
  ]);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState("CONGE_ANNUEL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const refreshEmployeeData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${currentUser.id}` };

      // Get leaves
      const resLeaves = await fetch("/api/leave-requests", { headers });
      const dLeaves = await resLeaves.json();
      if (dLeaves.success) setLeaves(dLeaves.data);

      // Get notifications
      const resNotifs = await fetch("/api/notifications", { headers });
      const dNotifs = await resNotifs.json();
      if (dNotifs.success) setNotifications(dNotifs.data);

    } catch (e) {
      console.error(e);
      toast.error("Défaillance lors de l'actualisation de votre espace personnel");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEmployeeData();
  }, [currentUser]);

  // Submit dynamic leave request
  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error("Veuillez remplir l'intégralité du formulaire");
      return;
    }

    try {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          type: leaveType,
          startDate,
          endDate,
          reason
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Demande transmise avec succès aux analystes RH AFG !");
        setShowLeaveModal(false);
        setReason("");
        refreshEmployeeData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Impossible d'expédier la requête.");
    }
  };

  // Mark notification read
  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${currentUser.id}` }
      });
      refreshEmployeeData();
    } catch (e) {
      // Slitently catch
    }
  };

  // Delete/Clear notification
  const handleClearNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.id}` }
      });
      toast.success("Notification effacée.");
      refreshEmployeeData();
    } catch (e) {
      // Slitently catch
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Banner card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Espace Collaborateur Habilité
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-2">
              Bienvenue, {currentUser?.fullName || "Agent AFG"}
            </h1>
            <p className="text-white/70 text-xs mt-1">
              Consultez votre dossier RH, suivez vos soldes de congés et gérez vos justificatifs cryptés d'accrédition.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-center font-mono text-xs shadow-inner">
            <span className="text-white/60 text-[9px] block">VOTRE ID UNIQUE</span>
            <span className="text-white font-black block mt-0.5">{currentUser?.matricule || "AFG-0000"}</span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left pane: tasks and past leaves requests */}
        <div className="space-y-6 md:col-span-2">
          {/* Personal tasks list */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-855">Vos Instructions & Tâches</h3>
              <span className="text-[9.5px] font-mono bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                {personalTasks.filter(t => t.status === "pending").length} en attente
              </span>
            </div>

            <div className="space-y-2.5">
              {personalTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50/10 transition-all text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-xl shrink-0 ${t.status === "COMPLETED" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}>
                      {t.status === "COMPLETED" ? (
                        <Icons.Check className="w-4 h-4" />
                      ) : (
                        <Icons.Clock className="w-4 h-4" />
                      )}
                    </span>
                    <span className={`font-semibold ${t.status === "COMPLETED" ? "line-through text-slate-405" : "text-slate-705"}`}>
                      {t.text}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase shrink-0 ${t.status === "COMPLETED" ? "text-emerald-500" : "text-amber-500"}`}>
                    {t.status === "COMPLETED" ? "Signé" : "À Faire"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Leave Requests Section */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-855 font-sans">Suivi de vos Demandes de Congés</h3>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-all font-sans cursor-pointer"
              >
                Nouvelle Demande
              </button>
            </div>

            {isLoading ? (
              <p className="text-[11px] text-slate-400">Arrivée des flux...</p>
            ) : leaves.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">Aucune demande de congé soumise à ce jour.</div>
            ) : (
              <div className="space-y-3 font-sans text-xs">
                {leaves.map((l) => (
                  <div key={l.id} className="p-3 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-slate-350 transition-all">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-805 block">
                        {l.type === "CONGE_ANNUEL" ? "Vacance Annuelle" : "Permission Exceptionnelle"}
                      </span>
                      <p className="text-slate-400 text-[10.5px]">Période: {l.startDate} au {l.endDate}</p>
                      <p className="text-slate-500 text-[10.5px]">Motif formulé: "{l.reason}"</p>
                      {l.approverComment && (
                        <p className="text-indigo-600 bg-indigo-50/50 p-2 border rounded-xl text-[10px] mt-1 font-semibold">
                          Avis DRH: "{l.approverComment}"
                        </p>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black ${
                      l.status === "approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : l.status === "pending"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-500"
                    }`}>
                      {l.status === "approved" ? "AVIS EXÉCUTOIRE" : l.status === "pending" ? "EN COURS" : "REJETÉ"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: instructions notification workspace */}
        <div className="space-y-6">
          {/* Shortcuts card and quick controls */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="space-y-4 text-xs font-sans">
              <h3 className="text-xs font-bold text-slate-805">Raccourcis Mon Espace</h3>
              <p className="text-slate-400 text-[10.5px]">Tâches d'accréditations prioritaires.</p>

              <div className="space-y-2.5">
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/50 text-slate-705 border border-transparent hover:border-indigo-150 rounded-2xl text-[10.5px] font-bold transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icons.Plane className="w-4 h-4 text-indigo-500" />
                    <span>Demander un congé d'absence</span>
                  </div>
                  <Icons.Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    toast.success("Impression de votre fiche de paie de l'exercice Mai lancée.");
                  }}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/5/50 text-slate-705 border border-transparent hover:border-indigo-150 rounded-2xl text-[10.5px] font-bold transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icons.FileSpreadsheet className="w-4 h-4 text-emerald-505" />
                    <span>Télécharger fiches de paie</span>
                  </div>
                  <Icons.Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-550 leading-relaxed font-semibold mt-4">
              Consignez toutes vos fiches numérisées dans le coffre fort via la GED latérale pour garantir la conformité audit active.
            </div>
          </div>

          {/* Real System Notifications Feed */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-805 flex items-center gap-2">
              <Icons.Bell className="w-4 h-4 text-indigo-600 animate-bounce" />
              <span>Notifications Systèmes</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-[10px] text-slate-400">Aucun message non-lu.</p>
            ) : (
              <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`p-3 border rounded-2xl text-[11px] relative cursor-pointer hover:bg-slate-100/50 transition-all ${
                      n.status === "UNREAD" ? "bg-indigo-50/50 border-indigo-100 font-semibold" : "bg-white text-slate-505"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearNotif(n.id);
                      }}
                      className="absolute right-2 top-2 text-slate-300 hover:text-rose-500 cursor-pointer"
                    >
                      <Icons.X className="w-3 h-3" />
                    </button>
                    <span className="block text-slate-805 text-xs font-bold">{n.title}</span>
                    <p className="text-[10.5px] text-slate-500 mt-1">{n.message}</p>
                    <span className="text-[8px] text-slate-400 block mt-1 font-mono">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Leave request modal popup */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in text-xs text-slate-805">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-855">Initialiser une Demande d'Absence</h3>
              <button onClick={() => setShowLeaveModal(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLeave} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Type d'Absence</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none bg-white font-medium"
                >
                  <option value="CONGE_ANNUEL">Congé Annuel Régulier</option>
                  <option value="PERMISSION">Permission de Sortie Exceptionnelle</option>
                  </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Date Initiale *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Date Terminale *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Justificatif explicatif de la demande *</label>
                <textarea
                  placeholder="Ex: Urgence d'hospitalisation familiale, justificatifs d'accompagnement médicaux d'enfants..."
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-100 rounded-xl focus:outline-none h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-all shadow"
                >
                  Expédier au Directeur Régional
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl font-semibold cursor-pointer"
                >
                  Raccrocher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
