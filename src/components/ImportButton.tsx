/**
 * ImportButton.tsx — Bouton d'import premium (Excel / CSV → aperçu → API)
 * GRH BANQUE — AFG Bank Gabon
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { apiMutate } from "../services/api.client";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────────────── */

type ImportEntity = "employees" | "documents";

interface ImportButtonProps {
  entity: ImportEntity;
  label?: string;
  className?: string;
  onSuccess?: () => void;
}

interface ParsedFile {
  fileName: string;
  rows: Record<string, unknown>[];
  columns: string[];
}

const ENTITY_LABELS: Record<ImportEntity, string> = {
  employees: "Collaborateurs",
  documents: "Documents",
};

const ACCEPTED_EXTENSIONS = ".xlsx,.xls,.csv";

/* ──────────────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────────────── */

export default function ImportButton({
  entity,
  label,
  className = "",
  onSuccess,
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  /* ── Keyboard: Escape to close ─────────────────────────────────── */
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  /* ── Trigger the hidden input ──────────────────────────────────── */
  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /* ── Parse selected file ───────────────────────────────────────── */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so re-selecting same file triggers change
      e.target.value = "";

      const loadingId = toast.loading(`Lecture de « ${file.name} »…`);

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          toast.error("Le fichier ne contient aucune feuille.", { id: loadingId });
          return;
        }

        const sheet = workbook.Sheets[firstSheet];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });

        if (jsonRows.length === 0) {
          toast.error("Le fichier est vide — aucune ligne de données détectée.", {
            id: loadingId,
          });
          return;
        }

        const columns = Object.keys(jsonRows[0]);

        setParsed({
          fileName: file.name,
          rows: jsonRows,
          columns,
        });

        setModalOpen(true);
        toast.success(
          `${jsonRows.length} ligne(s) détectée(s) dans « ${file.name} ».`,
          { id: loadingId }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(`Impossible de lire le fichier : ${msg}`, { id: loadingId });
      }
    },
    []
  );

  /* ── Close & cleanup ───────────────────────────────────────────── */
  const handleClose = useCallback(() => {
    if (importing) return;
    setModalOpen(false);
    setParsed(null);
  }, [importing]);

  /* ── Backdrop click ────────────────────────────────────────────── */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    },
    [handleClose]
  );

  /* ── Confirm import ────────────────────────────────────────────── */
  const handleConfirm = useCallback(async () => {
    if (!parsed) return;

    setImporting(true);
    const loadingId = toast.loading(
      `Import de ${parsed.rows.length} ligne(s) — ${ENTITY_LABELS[entity]}…`
    );

    try {
      const result = await apiMutate(
        `/api/import/${entity}`,
        "POST",
        { data: parsed.rows }
      );

      toast.success(
        result.message || `Import réussi — ${parsed.rows.length} ligne(s) traitée(s).`,
        { id: loadingId }
      );

      setModalOpen(false);
      setParsed(null);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur serveur";
      toast.error(`Échec de l'import : ${msg}`, { id: loadingId });
    } finally {
      setImporting(false);
    }
  }, [parsed, entity, onSuccess]);

  /* ── Format cell value for display ─────────────────────────────── */
  const formatCell = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "—";
    if (value instanceof Date) {
      return value.toLocaleDateString("fr-GA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
    return String(value);
  };

  /* ── Preview rows (max 5) ──────────────────────────────────────── */
  const previewRows = parsed?.rows.slice(0, 5) ?? [];

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={`import-file-input-${entity}`}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Sélectionner un fichier à importer pour ${ENTITY_LABELS[entity]}`}
      />

      {/* Trigger button */}
      <button
        id={`import-btn-${entity}`}
        type="button"
        onClick={handleButtonClick}
        aria-label={label || `Importer ${ENTITY_LABELS[entity]}`}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5
          bg-[#C9A84C] hover:bg-[#d4b55e] active:bg-[#b8993f]
          text-[#07080D] text-[11px] font-bold rounded-full
          shadow-md shadow-[#C9A84C]/20
          transition-all duration-200 cursor-pointer select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080D]
          ${className}
        `}
      >
        <Upload className="w-3.5 h-3.5" />
        {label || `Importer ${ENTITY_LABELS[entity]}`}
      </button>

      {/* ── Preview Modal ──────────────────────────────────────────── */}
      {modalOpen && parsed && (
        <div
          id={`import-modal-backdrop-${entity}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`import-modal-title-${entity}`}
          onClick={handleBackdropClick}
          className="
            fixed inset-0 z-[9999] flex items-center justify-center
            bg-black/80 backdrop-blur-xl
            animate-[fadeIn_200ms_ease-out]
          "
        >
          <div
            ref={modalRef}
            className="
              relative w-full max-w-3xl mx-4
              bg-[#0D0E14]/95 backdrop-blur-2xl
              border border-white/10
              rounded-2xl shadow-2xl shadow-black/60
              flex flex-col max-h-[85vh]
              animate-[slideUp_250ms_ease-out]
            "
          >
            {/* ── Modal Header ──────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C9A84C]/15 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h2
                    id={`import-modal-title-${entity}`}
                    className="text-sm font-bold text-white"
                  >
                    Aperçu de l'import
                  </h2>
                  <p className="text-[10px] text-white/50 mt-0.5 font-medium">
                    {ENTITY_LABELS[entity]} — Vérifiez les données avant confirmation
                  </p>
                </div>
              </div>

              <button
                id={`import-modal-close-${entity}`}
                type="button"
                onClick={handleClose}
                disabled={importing}
                aria-label="Fermer l'aperçu"
                className="
                  p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5
                  transition-colors duration-150 cursor-pointer
                  disabled:opacity-30 disabled:cursor-not-allowed
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── File info ─────────────────────────────────────── */}
            <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-white/5 bg-white/[0.02]">
              <InfoBadge label="Fichier" value={parsed.fileName} />
              <InfoBadge label="Lignes" value={String(parsed.rows.length)} />
              <InfoBadge label="Colonnes" value={String(parsed.columns.length)} />
            </div>

            {/* ── Preview Table ─────────────────────────────────── */}
            <div className="flex-1 overflow-auto px-4 py-4 min-h-0">
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table
                    id={`import-preview-table-${entity}`}
                    className="w-full text-left border-collapse"
                  >
                    <thead>
                      <tr className="bg-[#C9A84C]/10 border-b border-[#C9A84C]/20">
                        <th className="px-3 py-2.5 text-[9px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold whitespace-nowrap">
                          #
                        </th>
                        {parsed.columns.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2.5 text-[9px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, ri) => (
                        <tr
                          key={`preview-row-${ri}`}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-3 py-2.5 text-[10px] text-white/30 font-mono tabular-nums">
                            {ri + 1}
                          </td>
                          {parsed.columns.map((col) => (
                            <td
                              key={`cell-${ri}-${col}`}
                              className="px-3 py-2.5 text-[11px] text-white/80 whitespace-nowrap max-w-[200px] truncate"
                              title={formatCell(row[col])}
                            >
                              {formatCell(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsed.rows.length > 5 && (
                  <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-[10px] text-white/30 font-medium">
                      <AlertTriangle className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                      {parsed.rows.length - 5} ligne(s) supplémentaire(s) non affichée(s)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Modal Footer ──────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-white/[0.02]">
              <button
                id={`import-cancel-${entity}`}
                type="button"
                onClick={handleClose}
                disabled={importing}
                className="
                  px-5 py-2.5 text-[11px] font-bold text-white/60
                  bg-white/5 hover:bg-white/10 rounded-full
                  transition-colors duration-150 cursor-pointer
                  disabled:opacity-30 disabled:cursor-not-allowed
                "
              >
                Annuler
              </button>

              <button
                id={`import-confirm-${entity}`}
                type="button"
                onClick={handleConfirm}
                disabled={importing}
                className="
                  inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold
                  bg-[#C9A84C] hover:bg-[#d4b55e] active:bg-[#b8993f]
                  text-[#07080D] rounded-full
                  shadow-md shadow-[#C9A84C]/20
                  transition-all duration-200 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/60
                "
              >
                {importing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {importing ? "Import en cours…" : "Confirmer l'import"}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   InfoBadge — Petit badge informatif réutilisable
   ────────────────────────────────────────────────────────────────────── */

interface InfoBadgeProps {
  label: string;
  value: string;
}

function InfoBadge({ label, value }: InfoBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
      <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 font-bold">
        {label}
      </span>
      <span className="text-[11px] text-white/90 font-semibold truncate max-w-[200px]" title={value}>
        {value}
      </span>
    </div>
  );
}
