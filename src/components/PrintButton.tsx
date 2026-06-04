/**
 * PrintButton.tsx — Bouton d'impression premium (CSS Print + jsPDF)
 * GRH BANQUE — AFG Bank Gabon
 */

import React, { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ────────────────────────────────────────────────────────────────────

type PrintMode = "window" | "pdf";

interface Column {
  header: string;
  dataKey: string;
}

interface PrintButtonProps {
  /** Données tabulaires à imprimer */
  data: Record<string, unknown>[];
  /** Colonnes à afficher */
  columns: Column[];
  /** Titre du rapport */
  title: string;
  /** Sous-titre ou contexte */
  subtitle?: string;
  /** Mode : 'window' (CSS print) ou 'pdf' (jsPDF) */
  mode?: PrintMode;
  /** Label du bouton */
  label?: string;
  className?: string;
}

// ─── Utilitaire PDF premium ───────────────────────────────────────────────────

function generatePdf(
  data: Record<string, unknown>[],
  columns: Column[],
  title: string,
  subtitle?: string
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // En-tête
  doc.setFillColor(0, 82, 204);
  doc.rect(0, 0, 297, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("AFG BANK GABON — Gestion Électronique des Documents RH", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 20);

  if (subtitle) {
    doc.setFontSize(8);
    doc.text(subtitle, 14, 26);
  }

  // Date d'impression
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(
    `Imprimé le : ${new Date().toLocaleString("fr-FR")}`,
    297 - 14,
    24,
    { align: "right" }
  );

  // Table
  const tableHeaders = columns.map((c) => c.header);
  const tableBody = data.map((row) =>
    columns.map((c) => {
      const val = row[c.dataKey];
      return val !== undefined && val !== null ? String(val) : "—";
    })
  );

  autoTable(doc, {
    startY: 34,
    head: [tableHeaders],
    body: tableBody,
    headStyles: {
      fillColor: [0, 68, 153],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: { fontSize: 7.5, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: { 0: { fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
    theme: "grid",
    tableLineColor: [200, 210, 230],
    tableLineWidth: 0.3,
    didDrawPage: (data) => {
      // Pied de page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Document confidentiel — AFG Bank Gabon S.A. | GRH BANQUE v2.0 | COBAC/BEAC Compliance",
        14,
        pageHeight - 6
      );
      doc.text(
        `Page ${data.pageNumber}`,
        297 - 14,
        pageHeight - 6,
        { align: "right" }
      );
    },
  });

  doc.save(`AFG_${title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`);
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function PrintButton({
  data,
  columns,
  title,
  subtitle,
  mode = "pdf",
  label,
  className = "",
}: PrintButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    if (data.length === 0) {
      toast.warning("Aucune donnée à imprimer.");
      return;
    }

    setLoading(true);
    const id = toast.loading(`Génération du rapport ${mode === "pdf" ? "PDF" : "d'impression"}...`);

    try {
      if (mode === "pdf") {
        // Génération PDF côté client avec jsPDF
        generatePdf(data, columns, title, subtitle);
        toast.success("Rapport PDF généré et téléchargé !", { id });
      } else {
        // Impression via fenêtre navigateur
        const printContent = buildPrintHtml(data, columns, title, subtitle);
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) {
          throw new Error("Le navigateur a bloqué l'ouverture de la fenêtre d'impression.");
        }
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
        toast.success("Impression lancée !", { id });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'impression";
      toast.error(msg, { id });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id={`print-btn-${title.replace(/\s/g, "-").toLowerCase()}`}
      onClick={handlePrint}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2.5
        bg-slate-700 hover:bg-slate-600 disabled:bg-slate-400
        text-white text-[11px] font-bold rounded-full
        shadow-md shadow-slate-700/20
        transition-all duration-200 cursor-pointer select-none
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Printer className="w-3.5 h-3.5" />
      )}
      {label || "Imprimer / PDF"}
    </button>
  );
}

// ─── HTML d'impression ─────────────────────────────────────────────────────

function buildPrintHtml(
  data: Record<string, unknown>[],
  columns: Column[],
  title: string,
  subtitle?: string
): string {
  const rows = data
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${row[c.dataKey] ?? "—"}</td>`).join("")}</tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title} — AFG BANK GRH</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1e293b; }
    header { background: #0052CC; color: white; padding: 12px 20px; }
    header h1 { font-size: 14px; font-weight: bold; }
    header p { font-size: 9px; margin-top: 2px; opacity: 0.8; }
    .meta { display: flex; justify-content: space-between; padding: 8px 20px; background: #f8faff; border-bottom: 1px solid #e2e8f0; font-size: 9px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 0; }
    th { background: #0044aa; color: white; padding: 8px 10px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 7px 10px; border-bottom: 1px solid #e8edf5; font-size: 9px; }
    tr:nth-child(even) td { background: #f8faff; }
    footer { margin-top: 16px; padding: 8px 20px; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <header>
    <h1>AFG BANK GABON — ${title}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ""}
  </header>
  <div class="meta">
    <span>GRH BANQUE v2.0 | Gestion Électronique des Documents RH</span>
    <span>Imprimé le : ${new Date().toLocaleString("fr-FR")} | ${data.length} enregistrement(s)</span>
  </div>
  <table>
    <thead>
      <tr>${columns.map((c) => `<th>${c.header}</th>`).join("")}</tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>Document confidentiel — AFG Bank Gabon S.A. | Conformité COBAC/BEAC | RGPD Gabon</footer>
</body>
</html>`;
}
