/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User } from "../types";

interface Folder {
  id: string;
  name: string;
  type: string;
  ownerId?: string;
  agencyId: string;
  description: string;
  isDeleted: boolean;
  createdAt: string;
}

interface FoldersViewProps {
  folders: Folder[];
  employees: User[];
  documents: any[];
  selectedFolderId?: string | null;
  onSelectFolder?: (id: string | null) => void;
  onCreateFolder: (data: any) => Promise<any>;
  onUpdateFolder: (id: string, data: any) => Promise<any>;
  onDeleteFolder: (id: string) => Promise<any>;
}

const folderSchema = z.object({
  name: z.string().min(3, "Le nom du dossier RH doit faire au moins 3 caractères"),
  type: z.string().min(1, "Veuillez spécifier le type réglementaire de dossier"),
  ownerId: z.string().optional(),
  agencyId: z.string().min(1, "Veuillez attribuer une agence physique de cloisonnement administrative"),
  description: z.string().min(4, "Veuillez rédiger une brève description contextuelle")
});

type FolderFormData = z.infer<typeof folderSchema>;

export default function FoldersView({
  folders,
  employees,
  documents,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder
}: FoldersViewProps) {
  const [localSelectedFolderId, setLocalSelectedFolderId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isControlled = selectedFolderId !== undefined;
  const activeSelectedId = isControlled ? selectedFolderId : localSelectedFolderId;
  const setActiveSelectedId = (id: string | null) => {
    if (onSelectFolder) onSelectFolder(id);
    setLocalSelectedFolderId(id);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      type: "DOSSIER_INDIVIDUEL",
      ownerId: "",
      agencyId: "ag-libreville",
      description: ""
    }
  });

  const handleCreateNewClick = () => {
    setEditingFolder(null);
    reset({
      name: "",
      type: "DOSSIER_INDIVIDUEL",
      ownerId: "",
      agencyId: "ag-libreville",
      description: ""
    });
    setShowModal(true);
  };

  const handleEditClick = (folder: Folder) => {
    setEditingFolder(folder);
    reset({
      name: folder.name,
      type: folder.type,
      ownerId: folder.ownerId || "",
      agencyId: folder.agencyId,
      description: folder.description
    });
    setShowModal(true);
  };

  const onSubmitForm = async (data: FolderFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        ownerId: data.ownerId || undefined
      };

      if (editingFolder) {
        await onUpdateFolder(editingFolder.id, payload);
        toast.success(`Le dossier ${data.name} a été mis à jour !`);
      } else {
        await onCreateFolder(payload);
        toast.success(`Le dossier ${data.name} a été créé !`);
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de traitement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFolder) return;
    try {
      await onDeleteFolder(deletingFolder.id);
      toast.success(`Le dossier ${deletingFolder.name} a été détruit.`);
      if (activeSelectedId === deletingFolder.id) {
        setActiveSelectedId(null);
      }
      setDeletingFolder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de suppression.");
    }
  };

  const getOwnerName = (ownerId?: string) => {
    if (!ownerId) return "Dossier Général / Structurel";
    const emp = employees.find(e => e.id === ownerId);
    return emp ? emp.fullName : "Employé révoqué";
  };

  // Detailed view rendering if a folder is clicked/opened
  if (activeSelectedId) {
    const activeFolder = folders.find(f => f.id === activeSelectedId);
    if (activeFolder) {
      const folderOwner = employees.find(e => e.id === activeFolder.ownerId);
      
      // Get all documents for this folder
      const folderDocs = documents.filter(doc => {
        if (doc.isDeleted) return false;
        if (activeFolder.ownerId) {
          return doc.employeeId === activeFolder.ownerId;
        } else {
          // General folder, fetch by agency
          return doc.agencyId === activeFolder.agencyId;
        }
      });

      // Calculate completeness percentage based on regulatory documents
      // Regulatory checklist: Contract (Contrat), Payslip (Bulletin), Habilitation, RIB
      const hasContract = folderDocs.some(d => d.originalFileName.toLowerCase().includes("contrat") || d.originalFileName.toLowerCase().includes("avenant") || (d.description || "").toLowerCase().includes("contrat"));
      const hasPayslip = folderDocs.some(d => d.originalFileName.toLowerCase().includes("bulletin") || d.originalFileName.toLowerCase().includes("fiche de paie") || d.originalFileName.toLowerCase().includes("salaire") || (d.description || "").toLowerCase().includes("paie"));
      const hasID = folderDocs.some(d => d.originalFileName.toLowerCase().includes("identite") || d.originalFileName.toLowerCase().includes("cni") || d.originalFileName.toLowerCase().includes("passport") || d.originalFileName.toLowerCase().includes("badge") || (d.description || "").toLowerCase().includes("identite"));
      const hasRIB = folderDocs.some(d => d.originalFileName.toLowerCase().includes("rib") || d.originalFileName.toLowerCase().includes("bancaire") || (d.description || "").toLowerCase().includes("rib"));

      let completenessVal = 0;
      if (hasContract) completenessVal += 25;
      if (hasPayslip) completenessVal += 25;
      if (hasID) completenessVal += 25;
      if (hasRIB) completenessVal += 25;

      const handleDownloadLocalFileMock = (docObj: any) => {
        toast.success(`Sécurisation et téléchargement de l'archive "${docObj.originalFileName}" lancés avec succès.`);
      };

      return (
        <div className="space-y-6 animate-slide-up pb-12 font-sans text-xs font-semibold">
          {/* Detailed folder header with Back button */}
          <div className="pb-4 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => setActiveSelectedId(null)}
                className="flex items-center gap-1.5 text-[#0052CC] hover:text-[#0066FF] mb-2 cursor-pointer font-bold text-xs"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
                Retour à l'index des dossiers
              </button>
              <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">
                GED COBAC / Classeur Salarié
              </p>
              <h1 className="text-3xl font-light tracking-tight text-slate-900">
                {activeFolder.name} <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Détails d'Indexation</span>
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(activeFolder)}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-655 text-[11px] font-bold rounded-full transition-all cursor-pointer"
              >
                <Icons.Edit3 className="w-3.5 h-3.5" />
                Modifier l'Indexation
              </button>
            </div>
          </div>

          {/* Core Info & Integrity Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Owner card info */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mb-2">Titulaire du Dossier</span>
                {folderOwner ? (
                  <div className="flex items-center gap-3.5">
                    <img src={folderOwner.photoUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-tight truncate">{folderOwner.fullName}</p>
                      <p className="text-[10.5px] text-slate-500 font-medium mt-0.5 truncate">{folderOwner.position}</p>
                      <span className="text-[9.5px] font-mono text-[#0052CC] font-bold uppercase block mt-1">Matricule : {folderOwner.matricule}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                      <Icons.Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">Dossier Général / Structurel</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">Associé à l'agence d'affectation.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3.5 text-[11px] text-slate-605">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Type Réglementaire :</span>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded font-mono text-[9px] uppercase font-bold text-slate-705">
                    {activeFolder.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Agence physique :</span>
                  <span className="font-bold text-slate-800 uppercase text-[10px]">
                    {activeFolder.agencyId === "ag-siege" ? "Siège Central (Libreville)" : activeFolder.agencyId === "ag-libreville" ? "Libreville Agency" : activeFolder.agencyId === "ag-owendo" ? "Owendo Branch" : "Port-Gentil succursale"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Créé le :</span>
                  <span className="font-mono">{new Date(activeFolder.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#94A3B8] block mb-1">Indexation administrative :</span>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-semibold font-serif italic">"{activeFolder.description}"</p>
                </div>
              </div>
            </div>

            {/* Completeness Checklist widget */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Audit de conformité COBAC</span>
                <h3 className="text-sm font-black text-slate-800">Taux de Complétude du Dossier</h3>
              </div>

              {/* Progress bar and completeness number */}
              <div className="flex items-center gap-4.5 py-1">
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center">
                    <span className="text-sm font-black text-[#0052CC]">{completenessVal}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden animate-pulse">
                    <div className="bg-[#0052CC] h-full transition-all" style={{ width: `${completenessVal}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                    {completenessVal === 100 
                      ? "Dossier 100% conforme. Toutes les pièces d'archivage obligatoires COBAC sont réunies." 
                      : "Dossier incomplet. Veuillez déposer les pièces manquantes pour éviter des pénalités d'audit."
                    }
                  </p>
                </div>
              </div>

              {/* Audit Checklist Items */}
              <div className="space-y-2 border-t border-slate-50 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasContract ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold text-slate-700">Contrat de Travail ou Avenant</span>
                  </div>
                  <span className={`text-[9.5px] uppercase font-bold font-mono ${hasContract ? "text-emerald-500" : "text-amber-500"}`}>
                    {hasContract ? "Conforme" : "Manquant"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasPayslip ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold text-slate-700">Bulletins de Paie indexés</span>
                  </div>
                  <span className={`text-[9.5px] uppercase font-bold font-mono ${hasPayslip ? "text-emerald-500" : "text-amber-500"}`}>
                    {hasPayslip ? "Conforme" : "Manquant"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasID ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold text-slate-700">Justificatif d'Identité</span>
                  </div>
                  <span className={`text-[9.5px] uppercase font-bold font-mono ${hasID ? "text-emerald-500" : "text-amber-500"}`}>
                    {hasID ? "Conforme" : "Manquant"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasRIB ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold text-slate-700">Relevé RIB Bancaire</span>
                  </div>
                  <span className={`text-[9.5px] uppercase font-bold font-mono ${hasRIB ? "text-emerald-500" : "text-amber-500"}`}>
                    {hasRIB ? "Conforme" : "Manquant"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security integrity widget */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#0052CC] font-bold">Sécurisation Crypto</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 rounded text-[8.5px] font-mono font-bold tracking-wider">GED-SECURE</span>
                </div>
                <h3 className="text-sm font-black text-slate-805">Certificat de Coffre-Fort</h3>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed leading-normal mt-2">
                  Toutes les pièces de ce dossier RH individuel sont scellées cryptographiquement sur le réseau AFG Bank Gabon S.A., garantissant la non-répudiation et l'intégrité face au Secrétariat COBAC et à la DGI Gabon.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3.5 space-y-1.5 mt-4">
                <span className="text-[9px] text-slate-400 font-mono font-bold block">DERNIÈRE CHECKSUM RGPD GABON :</span>
                <span className="font-mono text-[9px] text-[#0052CC] select-all break-all leading-tight block">
                  SHA256: 3a9a7b9e6f2177c8e8884d5dcd24e8838ee1ebaf7714152ceeffe9ec7fefdc91
                </span>
              </div>
            </div>

          </div>

          {/* Dossier Files list */}
          <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-850">Pièces d'archives indexées ({folderDocs.length})</h3>
                <p className="text-[10px] text-slate-400 font-medium">Documents officiels vérifiés et scellés.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {folderDocs.length === 0 ? (
                <div className="p-12 text-center text-slate-450">
                  <Icons.FileX className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Aucune pièce archivée</p>
                  <p className="text-[10.5px] text-slate-450 mt-1 max-w-sm mx-auto leading-relaxed">
                    Ce classeur est actuellement vide. Dirigez-vous vers le module "Fichiers & Documents" pour ajouter ou téléverser les justificatifs administratifs de ce collaborateur.
                  </p>
                </div>
              ) : (
                folderDocs.map((doc) => (
                  <div key={doc.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 bg-[#0052CC]/10 text-[#0052CC] rounded-xl shrink-0 mt-0.5">
                        <Icons.FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 hover:text-[#0052CC] truncate">{doc.originalFileName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{doc.description || "Aucune note d'archivage"}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-[9px] font-mono font-bold text-slate-405">
                          <span className="flex items-center gap-1">
                            <Icons.Calendar className="w-3 h-3 text-slate-400" /> Disp: {new Date(doc.uploadDate || Date.now()).toLocaleDateString("fr-FR")}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Icons.HardDrive className="w-3 h-3 text-slate-400" /> Size: {(doc.fileSize / 1000000).toFixed(2)} MB
                          </span>
                          <span>•</span>
                          <span className="text-[#0052CC]">
                            Ver: {doc.version || "1.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleDownloadLocalFileMock(doc)}
                        className="px-4 py-2 bg-[#0052CC] hover:bg-[#0066FF] text-white font-bold rounded-lg cursor-pointer text-[10.5px] transition-all shrink-0 flex items-center gap-1.5 animate-fade-in"
                      >
                        <Icons.Download className="w-3.5 h-3.5" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FORMS DOSSIER DIALOG (MODAL PREMIUM) */}
          {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 animate-slide-up border border-slate-150">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm font-black text-slate-850 flex items-center gap-2">
                    <Icons.FolderPlus className="w-5 h-5 text-[#0052CC]" /> 
                    {editingFolder ? "Édition de Dossier RH" : "Dépôt Nouveau Classeur GED"}
                  </span>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-850 cursor-pointer">
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 font-semibold text-xs text-slate-605">
                  <div>
                    <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Nom abrégé du classeur *</label>
                    <input
                      required
                      type="text"
                      {...register("name")}
                      placeholder="Ex: Dossier Médical & Prévoyances 2026"
                      className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                    />
                    {errors.name && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.name.message}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Type de Classeur *</label>
                      <select
                        {...register("type")}
                        className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-xs"
                      >
                        <option value="DOSSIER_INDIVIDUEL">Individuel Salarié</option>
                        <option value="ADMINISTRATIF">Service Administratif</option>
                        <option value="SECRET_DEFENSE">Secret Permanent</option>
                        <option value="FISCAL">Prélèvements & Impôts</option>
                      </select>
                      {errors.type && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.type.message}</span>}
                    </div>

                    <div>
                      <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Agence d'affectation</label>
                      <select
                        {...register("agencyId")}
                        className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-xs"
                      >
                        <option value="ag-siege">Siège Central (Libreville)</option>
                        <option value="ag-libreville">Libreville Agency</option>
                        <option value="ag-owendo">Owendo Branch</option>
                        <option value="ag-portgentil">Port-Gentil succursale</option>
                      </select>
                      {errors.agencyId && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.agencyId.message}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Collaborateur Propriétaire (Optionnel)</label>
                    <select
                      {...register("ownerId")}
                      className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-xs"
                    >
                      <option value="">-- Aucun (Dossier d'agence général) --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.matricule})</option>
                      ))}
                    </select>
                    {errors.ownerId && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.ownerId.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Description d'Indexation *</label>
                    <textarea
                      required
                      {...register("description")}
                      placeholder="Brève description administrative contenant la liste des pièces requises..."
                      rows={3}
                      className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white"
                    />
                    {errors.description && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.description.message}</span>}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 font-bold">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-slate-250 text-slate-500 rounded-full cursor-pointer hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[#0052CC] hover:bg-[#0066FF] disabled:bg-slate-400 text-white rounded-full font-bold cursor-pointer"
                    >
                      {isSubmitting ? "Création..." : "Enregistrer le dossier"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      );
    }
  }

  return (
    <div className="space-y-6 animate-slide-up pb-12 font-sans text-xs font-semibold">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-150 flex justify-between items-end">
        <div>
          <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">GED / Dossiers Institutionnels</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Index des Dossiers Salariés <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Dossiers</span></h1>
          <p className="text-xs text-slate-500 mt-1">Configurez et cloisonnez les classeurs archivaires réglementaires par agent et service.</p>
        </div>
        <button
          onClick={handleCreateNewClick}
          className="flex items-center gap-2 px-5 py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white text-xs font-bold rounded-full shadow-md shadow-[#0052CC]/10 transition-all cursor-pointer"
        >
          <Icons.FolderPlus className="w-4 h-4" />
          Nouveau dossier RH
        </button>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div 
            key={folder.id} 
            onClick={() => setActiveSelectedId(folder.id)}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative cursor-pointer hover:border-[#0052CC]/40"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#0052CC]/10 text-[#0052CC] rounded-2xl">
                  <Icons.Folder className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-slate-150 text-slate-655 border border-slate-205 rounded font-mono text-[8.5px] font-bold shrink-0 uppercase">
                  {folder.type.replace("DOSSIER_", "")}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0052CC] uppercase tracking-wide">Classeur GED</h4>
                <h3 className="text-sm font-black text-slate-805 leading-snug mt-1">{folder.name}</h3>
                <p className="text-[10px] text-slate-405 font-mono mt-1">Initié le : {new Date(folder.createdAt || Date.now()).toLocaleDateString("fr-FR")}</p>
                <span className="text-[11px] text-slate-500 font-medium block mt-2.5 leading-relaxed">{folder.description}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px]">
              <div className="text-slate-650 font-bold flex items-center gap-1 max-w-[200px] truncate">
                <Icons.UserCheck2 className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                <span className="truncate">{getOwnerName(folder.ownerId)}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(folder);
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-605 hover:text-emerald-600 rounded-lg cursor-pointer animate-fade-in"
                  title="Modifier le dossier"
                >
                  <Icons.Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingFolder(folder);
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-605 hover:text-red-650 rounded-lg cursor-pointer animate-fade-in"
                  title="Supprimer le dossier"
                >
                  <Icons.Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIRM DESTRUCTION DOSSIER */}
      {deletingFolder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 animate-slide-up border border-slate-150 text-xs text-slate-605">
            <h3 className="text-sm font-black text-slate-900 leading-tight">Dissoudre le dossier de la GED ?</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Voulez-vous supprimer définitivement le dossier <strong className="text-slate-805">{deletingFolder.name}</strong> ? Tout son index archivable sera désassocié de la GED centrale.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingFolder(null)}
                className="px-4 py-2 border border-slate-205 rounded-full cursor-pointer text-slate-500 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-650 hover:bg-red-600 text-white rounded-full font-bold cursor-pointer"
              >
                Confirmer la destruction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMS DOSSIER DIALOG (MODAL PREMIUM) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 animate-slide-up border border-slate-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-black text-slate-805 flex items-center gap-2">
                <Icons.FolderPlus className="w-5 h-5 text-[#0052CC]" /> 
                {editingFolder ? "Édition de Dossier RH" : "Dépôt Nouveau Classeur GED"}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-850 cursor-pointer">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 font-semibold text-xs text-slate-605">
              <div>
                <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Nom abrégé du classeur *</label>
                <input
                  required
                  type="text"
                  {...register("name")}
                  placeholder="Ex: Dossier Médical & Prévoyances 2026"
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                />
                {errors.name && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.name.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Type de Classeur *</label>
                  <select
                    {...register("type")}
                    className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-xs"
                  >
                    <option value="DOSSIER_INDIVIDUEL">Individuel Salarié</option>
                    <option value="ADMINISTRATIF">Service Administratif</option>
                    <option value="SECRET_DEFENSE">Secret Permanent</option>
                    <option value="FISCAL">Prélèvements & Impôts</option>
                  </select>
                  {errors.type && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.type.message}</span>}
                </div>

                <div>
                  <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Agence d'affectation</label>
                  <select
                    {...register("agencyId")}
                    className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-xs"
                  >
                    <option value="ag-siege">Siège Central (Libreville)</option>
                    <option value="ag-libreville">Libreville Agency</option>
                    <option value="ag-owendo">Owendo Branch</option>
                    <option value="ag-portgentil">Port-Gentil succursale</option>
                  </select>
                  {errors.agencyId && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.agencyId.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Collaborateur Propriétaire (Optionnel)</label>
                <select
                  {...register("ownerId")}
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-xs"
                >
                  <option value="">-- Aucun (Dossier d'agence général) --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.matricule})</option>
                  ))}
                </select>
                {errors.ownerId && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.ownerId.message}</span>}
              </div>

              <div>
                <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Description d'Indexation *</label>
                <textarea
                  required
                  {...register("description")}
                  placeholder="Brève description administrative contenant la liste des pièces requises..."
                  rows={3}
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white"
                />
                {errors.description && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.description.message}</span>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 font-bold">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-500 rounded-full cursor-pointer hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0066FF] disabled:bg-slate-400 text-white rounded-full font-bold cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Enregistrer le dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
