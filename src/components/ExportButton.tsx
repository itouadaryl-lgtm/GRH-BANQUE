/**
 * ExportButton.tsx — Bouton d'export premium (Excel / CSV)
 * GRH BANQUE — AFG Bank Gabon
 */

import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from "lucide-react";
import { GRH_TOKEN_KEY } from "../services/api.client";
import { toast } from "sonner";

type ExportEntity = "employees" | "documents" | "activity-logs";
type ExportFormat = "xlsx" | "csv";

interface ExportButtonProps {
  entity: ExportEntity;
  voirTout?: boolean;
  label?: string;
  className?: string;
}

async function triggerDownload(
  entity: ExportEntity,
  format: ExportFormat,
  voirTout: boolean
) {
  const token = localStorage.getItem(GRH_TOKEN_KEY);
  if (!token) throw new Error("Non authentifié");

  // CSV n'est disponible que pour les employés
  const url =
    format === "csv" && entity === "employees"
      ? `/api/export/employees/csv`
      : `/api/export/${entity}/${format}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Voir-Tout": voirTout ? "true" : "false",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Échec de l'export");
  }

  const blob = await res.blob();
  const contentDisp = res.headers.get("Content-Disposition") || "";
  const match = contentDisp.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] || `AFG_Export_${Date.now()}.${format}`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

const entityLabels: Record<ExportEntity, string> = {
  employees: "Collaborateurs",
  documents: "Documents GED",
  "activity-logs": "Journal d'Audit",
};

export default function ExportButton({
  entity,
  voirTout = false,
  label,
  className = "",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ferme le dropdown si clic externe
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setOpen(false);
    setLoading(format);
    const id = toast.loading(
      `Export ${entityLabels[entity]} en ${format.toUpperCase()}...`
    );
    try {
      await triggerDownload(entity, format, voirTout);
      toast.success(
        `Export ${format.toUpperCase()} réussi — fichier téléchargé !`,
        { id }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(`Échec de l'export : ${msg}`, { id });
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <div ref={dropdownRef} className={`relative inline-flex ${className}`}>
      {/* Main button */}
      <button
        id={`export-btn-${entity}`}
        onClick={() => !isLoading && setOpen((o) => !o)}
        disabled={isLoading}
        aria-haspopup="true"
        aria-expanded={open}
        className="
          flex items-center gap-2 px-4 py-2.5
          bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400
          text-white text-[11px] font-bold rounded-full
          shadow-md shadow-emerald-600/20
          transition-all duration-200 cursor-pointer select-none
        "
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {label || `Exporter ${entityLabels[entity]}`}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="
            absolute right-0 top-full mt-2 z-50
            bg-white border border-slate-200 rounded-2xl shadow-xl
            min-w-[200px] overflow-hidden animate-slide-up
          "
        >
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              Choisir le format
            </p>
          </div>

          <button
            id={`export-xlsx-${entity}`}
            role="menuitem"
            onClick={() => handleExport("xlsx")}
            className="
              w-full flex items-center gap-3 px-4 py-3
              hover:bg-emerald-50 transition-colors cursor-pointer text-left
            "
          >
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Excel (.xlsx)</p>
              <p className="text-[9.5px] text-slate-400 font-medium">
                Format premium avec mise en forme
              </p>
            </div>
          </button>

          {entity === "employees" && (
            <button
              id={`export-csv-${entity}`}
              role="menuitem"
              onClick={() => handleExport("csv")}
              className="
                w-full flex items-center gap-3 px-4 py-3
                hover:bg-blue-50 transition-colors cursor-pointer text-left
                border-t border-slate-50
              "
            >
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">CSV (.csv)</p>
                <p className="text-[9.5px] text-slate-400 font-medium">
                  Compatible toutes applications
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
