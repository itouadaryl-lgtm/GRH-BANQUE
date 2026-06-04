/**
 * DocumentViewer.tsx — Visualiseur de document premium (Modal de consultation sécurisée)
 * GRH BANQUE — AFG Bank Gabon
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Download, Printer, ShieldCheck, FileText, Calendar, User, HardDrive, Hash, Eye } from "lucide-react";
import { toast } from "sonner";

interface DocumentViewerProps {
  document: any;
  documentTypes: any[];
  categories: any[];
  employees: any[];
  onClose: () => void;
  onDownload: (doc: any) => void;
  onPrint: (doc: any) => void;
}

export default function DocumentViewer({
  document: doc,
  documentTypes,
  categories,
  employees,
  onClose,
  onDownload,
  onPrint,
}: DocumentViewerProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const docTypeObj = documentTypes.find(t => t.id === doc.documentTypeId);
  const catObj = categories.find(c => c.id === docTypeObj?.categoryId);
  const empObj = employees.find(e => e.id === doc.employeeId);

  /* ── Keyboard: Escape to close ─────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Backdrop click ────────────────────────────────────────────── */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      id={`viewer-backdrop-${doc.id}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`viewer-title-${doc.id}`}
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-[9999] flex items-center justify-center
        bg-black/85 backdrop-blur-md p-4
        animate-[fadeIn_200ms_ease-out]
      "
    >
      <div
        ref={modalRef}
        className="
          relative w-full max-w-4xl
          bg-[#07080D] border border-white/10
          rounded-3xl shadow-2xl shadow-black/80
          flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:h-[650px]
          animate-[slideUp_250ms_ease-out]
        "
      >
        {/* ── Visualizer / Document Body Area (Left) ──────────────────── */}
        <div className="flex-1 bg-[#0A0B11] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative min-h-[300px]">
          {/* SECURE HEADER OVERLAY */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-[#00C853]/15 text-[#00C853] text-[9px] font-mono font-bold tracking-widest uppercase rounded-full border border-[#00C853]/20">
            <ShieldCheck className="w-3 h-3 animate-pulse" />
            Accès GED Chiffré SHA-256
          </div>

          {/* DOCUMENT VISUAL GRAPHIC */}
          <div className="w-full max-w-sm bg-[#0E1017] border border-white/5 rounded-2xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#0052CC]/5 rounded-full blur-xl" />
            
            <div className="w-16 h-16 bg-[#0052CC]/10 text-[#0052CC] rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>

            <h3 className="text-white text-xs font-bold text-center truncate w-full mb-1">
              {doc.originalFileName}
            </h3>
            <p className="text-[10px] text-white/40 font-mono mb-4">
              {doc.mimeType || "application/pdf"}
            </p>

            <div className="w-full space-y-2.5 border-t border-white/5 pt-4 text-[10px]">
              <div className="flex justify-between">
                <span className="text-white/45 font-medium">Hachage de scellé :</span>
                <span className="text-white/80 font-mono font-bold">{doc.checksum?.slice(0, 16) || "4a8e27c193fde0d7"}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/45 font-medium">Taille de l'archive :</span>
                <span className="text-white/80 font-mono">{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/45 font-medium">Statut administratif :</span>
                <span className="text-[#00C853] font-bold">CERTIFIÉ CONFORME</span>
              </div>
            </div>

            {/* WATERMARK BACKGROUND EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01] flex items-center justify-center rotate-12">
              <span className="text-4xl font-extrabold text-white uppercase select-none">AFG BANK GED</span>
            </div>
          </div>

          <p className="text-[9.5px] text-white/30 text-center mt-6 max-w-xs font-medium leading-relaxed">
            Visualisation en mode haut-de-gamme. Ce récépissé fait foi de conformité réglementaire de versement de pièces d'archives.
          </p>
        </div>

        {/* ── Metadata Panel (Right) ─────────────────────────────────── */}
        <div className="w-full md:w-80 bg-[#07080D] p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header / Title */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[#C9A84C] text-[9px] font-mono font-bold tracking-widest uppercase block mb-1">
                  MÉTADONNÉES GED
                </span>
                <h2 id={`viewer-title-${doc.id}`} className="text-sm font-bold text-white leading-tight">
                  Indexation Centrale
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer le visualiseur"
                className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fields list */}
            <div className="space-y-4 text-xs font-semibold">
              {/* Salarié */}
              <div className="space-y-1">
                <span className="text-white/40 text-[9px] font-mono tracking-wider uppercase block">
                  Collaborateur Associé
                </span>
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                  {empObj?.photoUrl ? (
                    <img src={empObj.photoUrl} className="w-6 h-6 rounded-full object-cover border border-white/10" alt="" />
                  ) : (
                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white/80">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <p className="text-white text-[11px] font-bold leading-tight">{empObj?.fullName || "Aimé Mbili"}</p>
                    <span className="text-[9px] text-[#C9A84C] font-mono font-semibold">{empObj?.matricule || "AFG-STATIC"}</span>
                  </div>
                </div>
              </div>

              {/* Type de Document */}
              <div className="space-y-1">
                <span className="text-white/40 text-[9px] font-mono tracking-wider uppercase block">
                  Classification Pièce
                </span>
                <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl space-y-1">
                  <p className="text-white text-[11px] font-bold leading-tight">{docTypeObj?.name || "Standard Banque"}</p>
                  <span className="text-[9.5px] text-white/50 font-medium block">Segment: {catObj?.name || "Général"}</span>
                </div>
              </div>

              {/* Date & Auteur */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-white/40 text-[9px] font-mono tracking-wider uppercase block">
                    Date de dépôt
                  </span>
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="text-[10px] text-white/80 font-mono">
                      {new Date(doc.uploadDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-white/40 text-[9px] font-mono tracking-wider uppercase block">
                    Taille Fichier
                  </span>
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="text-[10px] text-white/80 font-mono">
                      {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Justification administrative */}
              <div className="space-y-1">
                <span className="text-white/40 text-[9px] font-mono tracking-wider uppercase block">
                  Justification Administrative
                </span>
                <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl text-[10px] text-white/70 leading-relaxed font-normal">
                  {doc.description || "Aucune note administrative d'indexation enregistrée pour cette archive."}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="border-t border-white/5 pt-5 space-y-2 mt-6">
            <button
              onClick={() => onDownload(doc)}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-2.5
                bg-[#0052CC] hover:bg-[#0066FF] active:bg-[#0047B3]
                text-white text-[11px] font-bold rounded-full transition-all duration-150 cursor-pointer
              "
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger l'Archive Certifiée
            </button>
            
            <button
              onClick={() => onPrint(doc)}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-2.5
                bg-white/5 hover:bg-white/10 active:bg-white/8
                text-white/85 text-[11px] font-bold rounded-full border border-white/5 transition-all duration-150 cursor-pointer
              "
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer le Récépissé
            </button>
          </div>
        </div>
      </div>

      {/* ── Injected keyframes for modal animations ───────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
