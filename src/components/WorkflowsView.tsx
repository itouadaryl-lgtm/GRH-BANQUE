/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { Document, AccessRequest } from "../types";

interface WorkflowsViewProps {
  currentUser: any;
  documents: Document[];
  accessRequests: AccessRequest[];
  onRefreshAll: () => void;
}

export default function WorkflowsView({
  currentUser,
  documents,
  accessRequests,
  onRefreshAll,
}: WorkflowsViewProps) {
  const [filter, setFilter] = useState<"ALL" | "pending" | "approved" | "rejected">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [reason, setReason] = useState("");
  const [workflowType, setWorkflowType] = useState("SINGLE"); // SINGLE, DUAL, COBAC_ISO
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Decisional states
  const [processingReq, setProcessingReq] = useState<AccessRequest | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [messageError, setMessageError] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) {
      setMessageError("Veuillez sélectionner un document.");
      return;
    }
    if (!reason.trim()) {
      setMessageError("Veuillez renseigner un motif réglementaire.");
      return;
    }

    setIsSubmitting(true);
    setMessageError("");
    setMessageSuccess("");

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
        },
        body: JSON.stringify({
          documentId: selectedDocId,
          reason: `${reason} [Workflow: ${workflowType === "DUAL" ? "Double Contrôle COBAC" : workflowType === "COBAC_ISO" ? "Habilitation ISO Compliant" : "Validation Simple Manager"}]`
        })
      });

      const json = await response.json();
      if (json.success) {
        setMessageSuccess("Cycle d'approbation initié avec succès sur le coffre-fort d'AFG Bank !");
        setSelectedDocId("");
        setReason("");
        setShowCreateModal(false);
        onRefreshAll();
        setTimeout(() => setMessageSuccess(""), 4000);
      } else {
        setMessageError(json.message || "Erreur lors du démarrage du workflow");
      }
    } catch {
      setMessageError("Impossible de communiquer avec le serveur central COBAC.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessDecision = async (status: "approved" | "rejected") => {
    if (!processingReq) return;

    try {
      const response = await fetch(`/api/access-requests/${processingReq.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
        },
        body: JSON.stringify({
          status,
          approverComment: decisionComment || "Décision actée d'après l'habilitation hiérarchique."
        })
      });

      const json = await response.json();
      if (json.success) {
        setMessageSuccess(`Cycle d'approbation #${processingReq.id.toUpperCase()} résolu : ${status === "approved" ? "APPROUVÉ" : "REJETÉ"}`);
        setProcessingReq(null);
        setDecisionComment("");
        onRefreshAll();
        setTimeout(() => setMessageSuccess(""), 4000);
      } else {
        alert(json.message || "Erreur d'enregistrement de la décision");
      }
    } catch {
      alert("Erreur de communication sécurisée");
    }
  };

  const filteredRequests = accessRequests.filter((req) => {
    if (filter === "ALL") return true;
    return req.status === filter;
  });

  // Check if current user can approve (admins or DRH have processing high privileges)
  const canApprove = ["SUPER_ADMIN", "RH_MANAGER"].includes(currentUser?.roleName || "EMPLOYEE");

  return (
    <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
      
      {/* Title Header */}
      <div className="pb-4 border-b border-slate-150 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[#0052CC] text-[10px] font-mono uppercase tracking-widest mb-1 font-bold">Cycle de consultation réglementaire</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Workflows d'Approbation <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Sécurisés</span></h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervisez les délégations, décloisonnez temporairement les fiches de paie ou contrats, et validez les audits COBAC d'AFG Bank.
          </p>
        </div>
        
        <button
          onClick={() => {
            setMessageError("");
            setShowCreateModal(true);
          }}
          className="px-5 py-3.5 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-2xl flex items-center justify-center gap-2 font-display font-bold shadow-[0_4px_12px_rgba(0,82,204,0.15)] transition-all cursor-pointer hover:scale-[1.01]"
        >
          <Icons.PlusSquare className="w-4 h-4" />
          Démarrer un cycle d'approbation
        </button>
      </div>

      {messageSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-800 flex items-center gap-3">
          <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{messageSuccess}</span>
        </div>
      )}

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Total Cycles</span>
            <span className="text-lg font-bold text-slate-800">{accessRequests.length}</span>
          </div>
          <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-500">
            <Icons.Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-600 font-mono block uppercase">Approuvés</span>
            <span className="text-lg font-bold text-emerald-650">{accessRequests.filter(r => r.status === "approved").length}</span>
          </div>
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-600">
            <Icons.CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-500 font-mono block uppercase">En Attente</span>
            <span className="text-lg font-bold text-amber-600">{accessRequests.filter(r => r.status === "pending").length}</span>
          </div>
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-amber-500 animate-pulse">
            <Icons.Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-500 font-mono block uppercase">Rejetés</span>
            <span className="text-lg font-bold text-red-600">{accessRequests.filter(r => r.status === "rejected").length}</span>
          </div>
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center border border-red-100 text-red-500">
            <Icons.XOctagon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main filter list panel */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* State tab swappable filter */}
        <div className="flex border-b border-slate-100 pb-3 justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100">
            {(["ALL", "pending", "approved", "rejected"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-[11px] cursor-pointer ${
                  filter === t 
                    ? "bg-white text-slate-800 shadow" 
                    : "text-slate-450 hover:text-slate-700"
                }`}
              >
                {t === "ALL" && "Tous les dossiers"}
                {t === "pending" && "En cours d'examen"}
                {t === "approved" && "Validés"}
                {t === "rejected" && "Exchanges Refusés"}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            Régime d'Habilitation Gabonais ISO-27001
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
            <Icons.Workflow className="w-8 h-8 mx-auto mb-2 text-slate-350" />
            <p className="font-semibold text-slate-500">Aucun cycle d'approbation actif pour ce filtre d'habilitation physique.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <div key={req.id} className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  {/* Photo or icon */}
                  {req.requesterPhotoUrl ? (
                    <img
                      src={req.requesterPhotoUrl}
                      alt={req.requesterName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center justify-center shrink-0 border border-slate-150">
                      {req.requesterName?.charAt(0) || "U"}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">{req.requesterName}</span>
                      <span className="text-[9px] text-[#0052CC] font-mono bg-slate-100 px-2 py-0.5 rounded-full uppercase truncate">
                        {req.requesterPosition}
                      </span>
                    </div>

                    <p className="text-slate-500 font-normal leading-relaxed text-xs">
                      Demande d'accès pour : <strong className="text-slate-750 font-bold">{req.documentName}</strong>
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Icons.Clock className="w-3.5 h-3.5" />
                      <span>Initié le {new Date(req.requestedAt).toLocaleDateString("fr-FR")} à {new Date(req.requestedAt).toLocaleTimeString("fr-FR")}</span>
                      <span>•</span>
                      <span className="italic font-normal">Motif: "{req.reason}"</span>
                    </div>

                    {req.approverComment && (
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 mt-2 text-[11px] text-slate-600 space-y-1">
                        <strong className="text-slate-700 block text-[10px] uppercase font-mono tracking-wider">Note d'approbateur central :</strong>
                        <p className="font-normal">"{req.approverComment}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  {/* Status Indicator Badge */}
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shadow-sm ${
                    req.status === "approved" 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : req.status === "rejected" 
                      ? "bg-red-50 text-red-500 border-red-100" 
                      : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      req.status === "approved" ? "bg-emerald-500" : req.status === "rejected" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    {req.status === "approved" ? "Approuvé" : req.status === "rejected" ? "Rejeté" : "En attente de validation"}
                  </span>

                  {/* Actions buttons */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-1.5">
                      {canApprove ? (
                        <button
                          onClick={() => {
                            setProcessingReq(req);
                            setDecisionComment("");
                          }}
                          className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-xl font-bold flex items-center gap-1 text-[11.5px] cursor-pointer shadow-sm"
                        >
                          <Icons.Sliders className="w-3.5 h-3.5" />
                          Prendre décision
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-normal">Habilitation RH Requise</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Decision taking Modal view */}
      {processingReq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-xs">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Icons.FileCheck className="w-5 h-5 text-[#0052CC]" />
                Habilitation de Consultation
              </h3>
              <button
                onClick={() => setProcessingReq(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-semibold text-slate-650">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                <p className="text-slate-405 text-[9px] uppercase font-mono">Demandeur :</p>
                <p className="text-slate-800 text-xs font-bold">{processingReq.requesterName} ({processingReq.requesterPosition})</p>
                <p className="text-slate-405 text-[9px] uppercase font-mono mt-2">Document ciblé :</p>
                <p className="text-slate-800 text-xs font-bold">{processingReq.documentName}</p>
                <p className="text-slate-405 text-[9px] uppercase font-mono mt-2">Justification d'audit :</p>
                <p className="text-slate-600 font-normal italic mt-0.5">"{processingReq.reason}"</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-bold block">Instruction / Visa de l'approbateur (Note de décision) :</label>
                <textarea
                  placeholder="Écrivez un commentaire d'audit réglementaire..."
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0052CC] font-normal leading-relaxed text-slate-750"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleProcessDecision("approved")}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <Icons.CheckCircle2 className="w-4 h-4" />
                  Approuver & Valider
                </button>
                <button
                  onClick={() => handleProcessDecision("rejected")}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <Icons.XCircle className="w-4 h-4" />
                  Rejeter la demande
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Start approval workflow modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-xs">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Icons.Workflow className="w-5 h-5 text-[#0052CC]" />
                Lancer un Cycle de Validation GED
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>

            {errorMsgLocal() && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-800 font-semibold">
                {errorMsgLocal()}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-bold block">Document central cible *</label>
                <select
                  required
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 outline-none rounded-xl focus:border-[#0052CC] font-semibold text-slate-750"
                >
                  <option value="">-- Sélectionnez la pièce archivée à auditer --</option>
                  {documents.filter(d => !d.isDeleted).map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.originalFileName} (Réf ID: {doc.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-bold block">Habilitation de visa réglementaire (Type)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkflowType("SINGLE")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      workflowType === "SINGLE"
                        ? "bg-slate-900 text-white border-transparent shadow"
                        : "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100/50"
                    }`}
                  >
                    <Icons.FileText className="w-4 h-4" />
                    <span>Visa Simple</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkflowType("DUAL")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      workflowType === "DUAL"
                        ? "bg-slate-900 text-white border-transparent shadow"
                        : "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100/50"
                    }`}
                  >
                    <Icons.ShieldAlert className="w-4 h-4 text-[#ffd60a]" />
                    <span>Double Contrôle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkflowType("COBAC_ISO")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      workflowType === "COBAC_ISO"
                        ? "bg-slate-900 text-white border-transparent shadow"
                        : "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100/50"
                    }`}
                  >
                    <Icons.Lock className="w-4 h-4 text-emerald-400" />
                    <span>Habilité ISO</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-bold block">Justification de surclassement d'accès ou d'audit *</label>
                <textarea
                  required
                  placeholder="Saisissez le motif de consultation ou de visa pour conformité COBAC réglementaire..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3.5}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0052CC] font-normal leading-relaxed text-slate-750"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icons.Rocket className="w-4 h-4" />
                  )}
                  Lancer le workflow réglementaire
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Audit compliance notes */}
      <div className="p-6 bg-slate-100 border border-slate-200 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Icons.Fingerprint className="w-5 h-5 text-[#0052CC]" />
          Traçabilité des Habilitations Intelligentes AFG Bank
        </h3>
        <p className="text-slate-600 font-normal leading-relaxed">
          Chaque signature d'approbation et émission de carte professionnelle déclenche l'exécution d'un registre de sécurité immuable. Le Double Contrôle intègre les plus strictes régulations d'audit de la COBAC de l'Afrique Centrale pour prévenir de manière proactive toute fuite d'informations ou violation de conformité réglementaire.
        </p>
      </div>

    </div>
  );

  function errorMsgLocal() {
    return messageError;
  }
}
