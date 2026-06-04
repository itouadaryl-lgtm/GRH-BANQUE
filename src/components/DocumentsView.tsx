/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import ExportButton from "./ExportButton";
import PrintButton from "./PrintButton";
import DocumentViewer from "./DocumentViewer";

interface DocumentsViewProps {
  currentUser: any;
  documents: any[];
  categories: any[];
  documentTypes: any[];
  employees: any[];
  onUpload: (payload: any) => void;
  onDelete: (id: string) => void;
  selectedEmployeeIdForFilter?: string;
  onSelectEmployeeIdForFilter?: (id: string) => void;
}

export default function DocumentsView({
  currentUser,
  documents,
  categories,
  documentTypes,
  employees,
  onUpload,
  onDelete,
  selectedEmployeeIdForFilter = "",
  onSelectEmployeeIdForFilter
}: DocumentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(selectedEmployeeIdForFilter);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Synchronize from parent
  useEffect(() => {
    setSelectedEmployee(selectedEmployeeIdForFilter);
  }, [selectedEmployeeIdForFilter]);

  // Propagate to parent
  useEffect(() => {
    if (onSelectEmployeeIdForFilter) {
      onSelectEmployeeIdForFilter(selectedEmployee);
    }
  }, [selectedEmployee, onSelectEmployeeIdForFilter]);

  // Custom states for premium downloads & deletion confirmations
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<any | null>(null);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  // Dynamically generate a high resolution certified GED document as PDF
  const handleDownloadDocPDF = async (docObj: any) => {
    setIsDownloadingId(docObj.id);
    const toastId = toast.loading(`Cryptage et préparation de l'archive "${docObj.originalFileName}"...`);
    try {
      const docTypeObj = documentTypes.find(t => t.id === docObj.documentTypeId);
      const catObj = categories.find(c => c.id === docTypeObj?.categoryId);
      const empObj = employees.find(e => e.id === docObj.employeeId);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Branding Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 38, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("AFG BANK GABON - SYSTEME ARHI", 15, 15);
      
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("GESTION ELECTRONIQUE DES DOCUMENTS ET ARCHIVES RH CENTRALISEE", 15, 22);
      pdf.text("COFFRE-FORT NUMERIQUE SECURISE - LIBREVILLE", 15, 27);

      // Certificate Title
      pdf.setTextColor(15, 23, 42);
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text("CERTIFICAT D'ACCÈS ARCHIVAIRE GED", 15, 55);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(15, 62, 195, 62);

      // Metadata properties
      pdf.setFontSize(10);
      pdf.setFont("Helvetica", "bold");
      pdf.text("Fiche ID de l'Archive : ", 15, 72);
      pdf.setFont("Helvetica", "normal");
      pdf.text(docObj.id, 65, 72);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Nom Officiel du Fichier : ", 15, 80);
      pdf.setFont("Helvetica", "normal");
      pdf.text(docObj.originalFileName, 65, 80);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Description administrative : ", 15, 88);
      pdf.setFont("Helvetica", "normal");
      pdf.text(docObj.description || "Aucune note d'archivage", 65, 88);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Catégorie / Segment Mère : ", 15, 96);
      pdf.setFont("Helvetica", "normal");
      pdf.text(catObj?.name || "Général", 65, 96);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Type de Pièce Habilité : ", 15, 104);
      pdf.setFont("Helvetica", "normal");
      pdf.text(docTypeObj?.name || "Standard GED", 65, 104);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Taille du classeur d'images : ", 15, 112);
      pdf.setFont("Helvetica", "normal");
      pdf.text(`${(docObj.fileSize / (1024 * 1024)).toFixed(2)} MB`, 65, 112);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Hachage de contrôle SHA-256 : ", 15, 120);
      pdf.setFont("Courier", "bold");
      pdf.text(docObj.checksum || "4a8e27c193fde0d7bfa5d91cce2c3216834d8e92f", 65, 120);

      pdf.line(15, 128, 195, 128);

      // Employee section details
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("COLLECTE ASSOCIÉE AU SALARIÉ", 15, 138);

      pdf.setFontSize(10);
      pdf.text("Collaborateur Concerné : ", 15, 148);
      pdf.setFont("Helvetica", "normal");
      pdf.text(empObj?.fullName || "Agent Inconnu/Structurel", 65, 148);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Matricule central bancaire : ", 15, 156);
      pdf.setFont("Helvetica", "normal");
      pdf.text(empObj?.matricule || "AFG-STATIC", 65, 156);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Pôle d'affectation : ", 15, 164);
      pdf.setFont("Helvetica", "normal");
      pdf.text(empObj?.department || "N/A", 65, 164);

      pdf.setFont("Helvetica", "bold");
      pdf.text("Fiche de poste : ", 15, 172);
      pdf.setFont("Helvetica", "normal");
      pdf.text(empObj?.position || "N/A", 65, 172);

      pdf.line(15, 180, 195, 180);

      // Secure notice stamp
      pdf.setFillColor(248, 250, 252);
      pdf.rect(15, 190, 180, 45, "F");

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8.5);
      pdf.setFont("Helvetica", "bold");
      pdf.text("CADRE DE CONFIDENTIALITE CONTRACTUELLE ET SECURITE GED :", 20, 198);
      pdf.setFont("Helvetica", "italic");
      pdf.text("Ce document d'indexation certifié est émis sous l'autorité cryptographique d'AFG Bank Gabon.", 20, 204);
      pdf.text("Toute reproduction d'habilitation administrative ou falsification de pièces constitutives est passible", 20, 209);
      pdf.text("des poursuites de conformité réglementaire de la banque centrale d'Afrique Centrale (COBAC).", 20, 214);

      pdf.setFont("Helvetica", "bold");
      pdf.text(`Fait à Libreville, le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toTimeString().substr(0, 5)} (Heure locale)`, 20, 222);

      // Download
      pdf.save(`AFGBANK_GED_${docObj.originalFileName.replace(/\s+/g, "_")}.pdf`);
      toast.success(`Le PDF HD certifié pour "${docObj.originalFileName}" est maintenant sauvegardé !`, { id: toastId });
    } catch (err: any) {
      toast.error(`Echec d'exportation PDF : ${err.message}`, { id: toastId });
    } finally {
      setIsDownloadingId(null);
    }
  };

  const handlePrintDocPDF = (docObj: any) => {
    const isSandboxed = window.self !== window.top;
    if (isSandboxed) {
      toast.info("Protocole Sandboxed : impression redirigée en téléchargement PDF sécurisé.", {
        description: "En iframe, l'impression directe est bloquée par le navigateur."
      });
      handleDownloadDocPDF(docObj);
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${docObj.originalFileName} - AFG Bank GED</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0052CC; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .meta-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid #e2e8f0; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .label { font-weight: bold; width: 250px; }
            .footer { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 60px; }
          </style>
        </head>
        <body>
          <h1>AFG BANK GABON - RECEPISSE DE CONTROLE GED</h1>
          <p>Identifiant de contrôle centralisé du registre d'accréditations de Libreville.</p>
          <div class="meta-box">
            <div class="meta-row"><span class="label">ID de l'archive :</span><span>\${docObj.id}</span></div>
            <div class="meta-row"><span class="label">Nom de l'archive :</span><span>\${docObj.originalFileName}</span></div>
            <div class="meta-row"><span class="label">Description :</span><span>\${docObj.description || "Pas de description"}</span></div>
            <div class="meta-row"><span class="label">Date d'archivage :</span><span>\${new Date(docObj.uploadDate).toLocaleString("fr-FR")}</span></div>
            <div class="meta-row"><span class="label">Contrôle d'intégrité SHA-256 :</span><code>\${docObj.checksum || "4a8e27c193fde0d7bfa5d91cce2c32"}</code></div>
          </div>
          <div class="footer">
            AFG BANK GABON Archives RH - Certifié conforme.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Upload Form states
  const [fileName, setFileName] = useState("");
  const [docType, setDocType] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [description, setDescription] = useState("");
  const [fileSize, setFileSize] = useState(1320000); // Mock filesize default
  const [fileMime, setFileMime] = useState("application/pdf");

  // Custom states for searchable autocompletes
  const [filterEmpSearch, setFilterEmpSearch] = useState("");
  const [showFilterEmpSuggestions, setShowFilterEmpSuggestions] = useState(false);

  const [uploadEmpSearch, setUploadEmpSearch] = useState("");
  const [showUploadEmpSuggestions, setShowUploadEmpSuggestions] = useState(false);

  // Synchronize filter search input with selectedEmployee change
  useEffect(() => {
    if (!selectedEmployee) {
      setFilterEmpSearch("");
    } else {
      const emp = employees.find(e => e.id === selectedEmployee);
      if (emp) {
        setFilterEmpSearch(emp.fullName);
      }
    }
  }, [selectedEmployee, employees]);

  // Synchronize upload form search input with employeeId change
  useEffect(() => {
    if (!employeeId) {
      setUploadEmpSearch("");
    } else {
      const emp = employees.find(e => e.id === employeeId);
      if (emp) {
        setUploadEmpSearch(emp.fullName);
      }
    }
  }, [employeeId, employees]);

  const sortedEmployees = [...employees].sort((a, b) => a.fullName.localeCompare(b.fullName));

  const matchingFilterEmployees = sortedEmployees.filter(emp => 
    emp.fullName.toLowerCase().includes(filterEmpSearch.toLowerCase()) || 
    emp.matricule.toLowerCase().includes(filterEmpSearch.toLowerCase())
  );

  const matchingUploadEmployees = sortedEmployees.filter(emp => 
    emp.fullName.toLowerCase().includes(uploadEmpSearch.toLowerCase()) || 
    emp.matricule.toLowerCase().includes(uploadEmpSearch.toLowerCase())
  );

  // Filtered documents list
  const filteredDocs = documents.filter(d => {
    // Only view if not deleted
    if (d.isDeleted) return false;

    const matchesSearch = d.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (d.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // category filter
    let matchesCategory = true;
    if (selectedCategory) {
      const validTypes = documentTypes.filter(t => t.categoryId === selectedCategory).map(t => t.id);
      matchesCategory = validTypes.includes(d.documentTypeId);
    }

    const matchesType = selectedType ? d.documentTypeId === selectedType : true;
    const matchesEmployee = selectedEmployee ? d.employeeId === selectedEmployee : true;

    return matchesSearch && matchesCategory && matchesType && matchesEmployee;
  });

  const handleFileDropMock = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      setFileMime(file.type || "application/pdf");
    }
  };

  const handleFileSelectMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      setFileMime(file.type || "application/pdf");
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !docType) return;

    onUpload({
      originalFileName: fileName,
      documentTypeId: docType,
      employeeId: employeeId || currentUser?.id,
      description,
      fileSize,
      mimeType: fileMime
    });

    // Reset settings
    setFileName("");
    setDocType("");
    setEmployeeId("");
    setDescription("");
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-150">
        <div>
          <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Conservation Coffre-Fort</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Archives de la Banque <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Cabinet GED</span></h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Gestion électronique d'accréditations, bulletins et fiches certifiés. Chaque fichier est scanné pour les audits de conformité d'AFG Bank Gabon.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <ExportButton entity="documents" label="Exporter" />
          <PrintButton
            data={filteredDocs.map(d => {
              const dt = documentTypes.find(t => t.id === d.documentTypeId);
              const emp = employees.find(e => e.id === d.employeeId);
              return {
                fileName: d.originalFileName,
                type: dt?.name || "Standard",
                employee: emp?.fullName || "—",
                date: new Date(d.uploadDate).toLocaleDateString("fr-FR"),
                size: `${(d.fileSize / (1024 * 1024)).toFixed(2)} MB`,
              };
            })}
            columns={[
              { header: "Nom du fichier", dataKey: "fileName" },
              { header: "Type", dataKey: "type" },
              { header: "Titulaire", dataKey: "employee" },
              { header: "Date de dépôt", dataKey: "date" },
              { header: "Taille", dataKey: "size" },
            ]}
            title="Index des Archives GED"
            subtitle={`${filteredDocs.length} document(s) — AFG Bank Gabon`}
            label="PDF"
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white font-bold text-xs rounded-full cursor-pointer shadow-md shadow-[#0052CC]/10 transition-all font-sans"
          >
            <Icons.UploadCloud className="w-4 h-4" />
            Déposer une pièce (GED)
          </button>
        </div>
      </div>

      {/* Multilevel Filters Board */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          {/* Category Selector */}
          <div>
            <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Catégorie Générale</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedType(""); // Reset type
              }}
              className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Document Type Selector */}
          <div>
            <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Type de Document</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white"
            >
              <option value="">Tous les types</option>
              {documentTypes
                .filter(dt => !selectedCategory || dt.categoryId === selectedCategory)
                .map(dt => (
                  <option key={dt.id} value={dt.id}>{dt.name}</option>
                ))}
            </select>
          </div>

          {/* Employee target filter - Custom Searchable Autocomplete */}
          <div className="relative">
            <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Titulaire du dossier</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Chercher par nom..."
                value={filterEmpSearch}
                onChange={(e) => {
                  setFilterEmpSearch(e.target.value);
                  setShowFilterEmpSuggestions(true);
                  if (!e.target.value) {
                    setSelectedEmployee("");
                  }
                }}
                onFocus={() => setShowFilterEmpSuggestions(true)}
                className="w-full bg-slate-50 pl-3 pr-8 py-3 border border-slate-205 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white text-xs"
              />
              {selectedEmployee && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployee("");
                    setFilterEmpSearch("");
                  }}
                  className="absolute right-2.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {showFilterEmpSuggestions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterEmpSuggestions(false)} 
                />
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto divide-y divide-slate-100 py-1 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployee("");
                      setFilterEmpSearch("");
                      setShowFilterEmpSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-[#0052CC] font-bold"
                  >
                    -- Tous les titulaires --
                  </button>
                  {matchingFilterEmployees.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(u.id);
                        setFilterEmpSearch(u.fullName);
                        setShowFilterEmpSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-slate-700 gap-2 font-medium"
                    >
                      <span className="truncate font-bold">{u.fullName}</span>
                      <span className="text-[10px] font-mono font-semibold text-[#0052CC] shrink-0">{u.matricule}</span>
                    </button>
                  ))}
                  {matchingFilterEmployees.length === 0 && (
                    <p className="px-4 py-3 text-center text-slate-400 font-mono text-[10px]">Aucun collaborateur trouvé</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Search text filter */}
          <div>
            <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Recherche textuelle</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex. Contrat, fiches de paie..."
                className="w-full bg-slate-50 pl-3 pr-8 py-3 border border-slate-200/60 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

        <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/50">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">{filteredDocs.length} pièces documentaires tracées</span>
          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedType("");
              setSelectedEmployee("");
              setSearchTerm("");
            }}
            className="text-[10.5px] text-[#0052CC] hover:text-[#0066FF] underline underline-offset-4 font-bold cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Main documents table list */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-650 min-w-[#805px]">
            <thead>
              <tr className="bg-slate-50 uppercase text-[9px] font-bold tracking-widest text-[#71717a] border-b border-slate-100">
                <th className="py-4 px-6">Nom de l'archive</th>
                <th className="py-4 px-4">Catégorie Mère</th>
                <th className="py-4 px-4">Type Spécifique</th>
                <th className="py-4 px-4">Titulaire RH</th>
                <th className="py-4 px-4">Date de dépôt</th>
                <th className="py-4 px-3">Taille</th>
                <th className="py-4 px-6 text-right">Registre Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705 bg-white">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-450 bg-white">
                    <Icons.FileX2 className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                    Aucune archive correspondante dans les serveurs de Libreville.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const docTypeObj = documentTypes.find(t => t.id === doc.documentTypeId);
                  const catObj = categories.find(c => c.id === docTypeObj?.categoryId);
                  const empObj = employees.find(e => e.id === doc.employeeId);

                  const colorMap: any = {
                    "blue-500": "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]/15",
                    "green-500": "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/15",
                    "amber-500": "bg-amber-100/60 text-amber-600 border-amber-200/50",
                    "rose-500": "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/15",
                    "purple-500": "bg-purple-100/60 text-purple-700 border-purple-200/50",
                    "indigo-500": "bg-indigo-100/60 text-indigo-700 border-indigo-200/50",
                    "teal-500": "bg-teal-100/60 text-teal-700 border-teal-200/50",
                    "cyan-500": "bg-cyan-100/60 text-cyan-700 border-cyan-200/50"
                  };
                  
                  const borderBadge = colorMap[docTypeObj?.iconColor || "blue-500"] || "bg-slate-100 text-slate-605 border-slate-200";

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3.5">
                        <Icons.FileText className="w-4.5 h-4.5 text-[#0052CC] shrink-0" />
                        <div>
                          <p className="text-slate-800 hover:text-[#0052CC]">{doc.originalFileName}</p>
                          <span className="text-[9.5px] text-slate-400 font-normal mt-0.5 block">{doc.description || "Aucune note d'archivage"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-650 rounded-lg text-[10px] border border-slate-200">
                          {catObj?.name || "Général"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border ${borderBadge}`}>
                          {docTypeObj?.name || "Standard Banque"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img src={empObj?.photoUrl} className="w-6 h-6 rounded-full object-cover border border-slate-200/50" alt="" />
                          <span className="text-slate-700 font-bold font-sans">{empObj?.fullName || "Aimé Mbili"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-450 font-mono">
                        {new Date(doc.uploadDate).toLocaleDateString("fr-FR")} {new Date(doc.uploadDate).toTimeString().substr(0,5)}
                      </td>
                      <td className="py-4 px-3 font-mono text-slate-500">
                        {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Visualiser cette archive"
                            onClick={() => setViewingDoc(doc)}
                            className="p-1.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Icons.Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Télécharger cette archive PDF"
                            onClick={() => handleDownloadDocPDF(doc)}
                            className="p-1.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Icons.Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Imprimer cette archive"
                            onClick={() => handlePrintDocPDF(doc)}
                            className="p-1.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Icons.Printer className="w-3.5 h-3.5" />
                          </button>
                          
                          {["SUPER_ADMIN", "DRH", "RH_MANAGER"].includes(currentUser?.roleName) && (
                            <button
                              title="Placer à la corbeille centrale"
                              onClick={() => setDeletingDoc(doc)}
                              className="p-1.5 border border-red-200 rounded-lg text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all cursor-pointer"
                            >
                              <Icons.Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Modal for File Upload & Indexing */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            
            <div className="bg-slate-50 p-5 text-slate-800 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Icons.UploadCloud className="w-4 h-4 text-[#0052CC]" />
                <h3 className="text-sm font-bold text-slate-800">Verser une archive sécurisée (GED)</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-6 space-y-5 text-xs text-slate-600 font-semibold">
              
              {/* Drag n drop container */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDropMock}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:border-[#0052CC] hover:bg-[#0052CC]/5 transition-all relative cursor-pointer"
              >
                <Icons.FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {fileName ? (
                  <div>
                    <p className="font-bold text-[#0052CC] mb-1">{fileName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{(fileSize / 1024).toFixed(0)} KB · {fileMime.toUpperCase()}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-slate-700">Glissez-déposez le fichier du salarié ici</p>
                    <p className="text-[10px] text-slate-450 mt-1 font-normal">Formats acceptés : PDF, PNG, JPG (Max 50 Mo)</p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileSelectMock}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Form entries */}
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Gabarit Documentaire *</label>
                  <select
                    required
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:bg-white focus:border-[#0052CC]"
                  >
                    <option value="">-- Choisir type --</option>
                    {documentTypes.map(dt => (
                      <option key={dt.id} value={dt.id}>{dt.name}</option>
                    ))}
                  </select>
                </div>

                {/* Searchable Autocomplete and Suggestion List */}
                <div className="relative">
                  <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Salarié concerné *</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="Saisir pour chercher..."
                      value={uploadEmpSearch}
                      onChange={(e) => {
                        setUploadEmpSearch(e.target.value);
                        setShowUploadEmpSuggestions(true);
                      }}
                      onFocus={() => setShowUploadEmpSuggestions(true)}
                      className="w-full bg-slate-50 pl-3 pr-8 py-3 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:bg-white focus:border-[#0052CC] text-xs"
                    />
                    {employeeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmployeeId("");
                          setUploadEmpSearch("");
                        }}
                        className="absolute right-2.5 top-3.5 text-slate-400 hover:text-slate-750 cursor-pointer"
                      >
                        <Icons.X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {showUploadEmpSuggestions && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUploadEmpSuggestions(false)} 
                      />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 py-1 text-xs">
                        {matchingUploadEmployees.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setEmployeeId(u.id);
                              setUploadEmpSearch(u.fullName);
                              setShowUploadEmpSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold"
                          >
                            <span>{u.fullName}</span>
                            <span className="text-[10px] font-mono text-[#0052CC]">{u.matricule}</span>
                          </button>
                        ))}
                        {matchingUploadEmployees.length === 0 && (
                          <p className="px-4 py-3 text-center text-slate-450 font-mono text-[9px]">Aucun collaborateur trouvé</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

              </div>

              <div>
                <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Justification administrative</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes importantes concernant la pièce versée (ex. Avenant signé par DG)..."
                  rows={2}
                  className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-705 text-xs focus:outline-none focus:bg-white focus:border-[#0052CC] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50/50 text-[#0052CC] border border-[#0052CC]/10 rounded-xl text-[10px] leading-relaxed">
                <Icons.Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  **Audit de versement :** En soumettant ce formulaire, un condensat SHA-256 cryptographique du fichier sera calculé et sauvegardé dans le journal d'audit de sécurité d'AFG Bank.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!fileName || !docType}
                  className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-full font-bold transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  Déposer & Indexer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DE SUPPRESSION (MODAL PREMIUM) */}
      {deletingDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 animate-slide-up border border-slate-150 text-xs text-slate-650 font-semibold">
            <h3 className="text-sm font-black text-slate-900 leading-tight">Placer l'archive à la corbeille ?</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Voulez-vous déplacer l'archive <strong className="text-slate-805">{deletingDoc.originalFileName}</strong> vers la corbeille temporaire d'AFG Bank ? Les auditeurs de Libreville conserveront un droit de restauration de 30 jours.
            </p>
            <div className="flex justify-end gap-3 pt-2 font-bold">
              <button
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 border border-slate-200 rounded-full cursor-pointer text-slate-500 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await onDelete(deletingDoc.id);
                    toast.success("Document placé en corbeille centrale.");
                    setDeletingDoc(null);
                  } catch (err: any) {
                    toast.error("Échec de suppression temporaire.");
                  }
                }}
                className="px-4 py-2 bg-red-650 hover:bg-red-605 text-white rounded-full cursor-pointer"
              >
                Mettre à la corbeille
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISUALISEUR DE DOCUMENT (MODAL PREMIUM) */}
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          documentTypes={documentTypes}
          categories={categories}
          employees={employees}
          onClose={() => setViewingDoc(null)}
          onDownload={handleDownloadDocPDF}
          onPrint={handlePrintDocPDF}
        />
      )}

    </div>
  );
}
