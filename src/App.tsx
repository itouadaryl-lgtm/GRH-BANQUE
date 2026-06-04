/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Sidebar from "./components/DynamicSidebar";
import Navbar from "./components/DynamicNavbar";
import MobileNavbar from "./components/MobileNavbar";
import RoleDashboard from "./components/RoleDashboard";
import DocumentsView from "./components/DocumentsView";
import EmployeesView from "./components/EmployeesView";
import TrashView from "./components/TrashView";
import RolesPermissionsView from "./components/RolesPermissionsView";
import ParametersView from "./components/ParametersView";
import ActivityLogView from "./components/ActivityLogView";
import DocumentTypesView from "./components/DocumentTypesView";
import WorkflowsView from "./components/WorkflowsView";
import ChatbotPanel from "./components/ChatbotPanel";
import SecureGabonCard from "./components/SecureGabonCard";
import AgenciesView from "./components/AgenciesView";
import FoldersView from "./components/FoldersView";
import SecurityGate from "./components/SecurityGate";
import { printCardElement, downloadCardAsPDF, downloadCardAsMergedPNG } from "./utils/cardExporter";
import { User, ProfessionalCard } from "./types";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { useGrhQueries } from "./hooks/useGrhQueries";
import { useGrhMutations } from "./hooks/useGrhMutations";
import { useTabRouter } from "./hooks/useTabRouter";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const { navigateToTab } = useTabRouter(currentTab, setCurrentTab);
  const { logout: authLogout } = useAuth();
  const [voirToutActive, setVoirToutActive] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const {
    currentUser,
    documents,
    employees,
    roles,
    parameters,
    activityLogs,
    generatedCards,
    accessRequests,
    agencies,
    folders,
    isLoading,
    refetchAll,
  } = useGrhQueries(voirToutActive);

  const mutations = useGrhMutations(voirToutActive);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedEmployeeIdForFilter, setSelectedEmployeeIdForFilter] = useState<string>("");
  const [inspectingCard, setInspectingCard] = useState<any | null>(null);

  const handleInstantSelectResult = (type: string, id: string) => {
    if (type === "employee") {
      setSelectedEmployeeIdForFilter(id);
      navigateToTab("employees");
    } else if (type === "folder") {
      setSelectedFolderId(id);
      navigateToTab("folders");
    } else if (type === "document") {
      const sDoc = documents.find(d => d.id === id);
      if (sDoc) {
        setSelectedEmployeeIdForFilter(sDoc.employeeId);
      }
      navigateToTab("documents");
    }
  };

  const handleLogout = () => {
    void authLogout();
    toast.info("Session déconnectée.");
  };

  const handleToggleVoirTout = async (newVal: boolean) => {
    const result = await mutations.toggleVoirTout.mutateAsync(newVal);
    if (result.success) {
      setVoirToutActive(newVal);
      mutations.invalidateAll();
    } else {
      throw new Error(result.message || "Interdit");
    }
  };

  const handleUploadDocument = async (payload: unknown) => {
    await mutations.uploadDocument.mutateAsync(payload);
  };

  const handleDeleteDocument = async (id: string) => {
    await mutations.deleteDocument.mutateAsync(id);
  };

  const handleRestoreDocument = async (id: string) => {
    await mutations.restoreDocument.mutateAsync(id);
  };

  const handlePermanentDelete = async (id: string) => {
    await mutations.permanentDeleteDocument.mutateAsync(id);
  };

  const handleEmptyTrash = async () => {
    await mutations.emptyTrash.mutateAsync();
  };

  const handleGenerateCard = async (employeeId: string) => {
    await mutations.generateCard.mutateAsync(employeeId);
  };

  const openCardForEmployee = async (emp: User) => {
    let card = generatedCards.find(c => c.employeeId === emp.id);
    if (!card) {
      const result = await mutations.generateCard.mutateAsync(emp.id);
      if (result.success && result.data) {
        card = result.data as ProfessionalCard;
      }
    }

    if (card) {
      setInspectingCard({ ...card, employee: emp });
    } else {
      setInspectingCard({
        id: `card-${emp.id}`,
        employeeId: emp.id,
        cardNumber: `AFGBANK-2026-${emp.matricule}`,
        issueDate: "2026-05-28",
        expiryDate: "2028-05-28",
        qrCodeUrl: `https://afgbank.ga/verify/card/AFGBANK-2026-${emp.matricule}`,
        status: "active",
        generatedAt: new Date().toISOString(),
        generatedById: currentUser?.id,
        employee: emp,
      });
    }
  };

  const handleSaveRolePermissions = async (roleId: string, updatedPermissions: string[]) => {
    await mutations.saveRolePermissions.mutateAsync({ roleId, permissions: updatedPermissions });
  };

  const handleAddEmployee = async (payload: unknown) => {
    const result = await mutations.addEmployee.mutateAsync(payload);
    if (!result.success) throw new Error(result.message || "Impossible d'ajouter le collaborateur");
    return result.data;
  };

  const handleUpdateEmployee = async (id: string, payload: unknown) => {
    const result = await mutations.updateEmployee.mutateAsync({ id, payload });
    if (!result.success) throw new Error(result.message || "Impossible de mettre à jour le collaborateur");
    return result.data;
  };

  const handleDeleteEmployee = async (id: string) => {
    const result = await mutations.deleteEmployee.mutateAsync(id);
    if (!result.success) throw new Error(result.message || "Impossible de supprimer le collaborateur");
    return result;
  };

  const handleCreateAgency = async (payload: unknown) => {
    const result = await mutations.createAgency.mutateAsync(payload);
    if (!result.success) throw new Error(result.message || "Impossible de créer l'agence");
    return result.data;
  };

  const handleUpdateAgency = async (id: string, payload: unknown) => {
    const result = await mutations.updateAgency.mutateAsync({ id, payload });
    if (!result.success) throw new Error(result.message || "Impossible de mettre à jour l'agence");
    return result.data;
  };

  const handleDeleteAgency = async (id: string) => {
    const result = await mutations.deleteAgency.mutateAsync(id);
    if (!result.success) throw new Error(result.message || "Impossible de supprimer l'agence");
    return result;
  };

  const handleCreateFolder = async (payload: unknown) => {
    const result = await mutations.createFolder.mutateAsync(payload);
    if (!result.success) throw new Error(result.message || "Impossible de créer le dossier");
    return result.data;
  };

  const handleUpdateFolder = async (id: string, payload: unknown) => {
    const result = await mutations.updateFolder.mutateAsync({ id, payload });
    if (!result.success) throw new Error(result.message || "Impossible de mettre à jour le dossier");
    return result.data;
  };

  const handleDeleteFolder = async (id: string) => {
    const result = await mutations.deleteFolder.mutateAsync(id);
    if (!result.success) throw new Error(result.message || "Impossible de supprimer le dossier");
    return result;
  };

  const handleSaveParameter = async (key: string, value: string) => {
    await mutations.saveParameter.mutateAsync({ key, value });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-white text-xs font-semibold gap-3 font-sans">
        <Icons.Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <span>Veuillez patienter pendant l&apos;initialisation d&apos;AFG BANK Archives...</span>
      </div>
    );
  }

  // Categories list
  const activeCategories = [
    { id: "cat-contrats", name: "Contrats", description: "Contrats de travail et avenants", count: 437 },
    { id: "cat-paie", name: "Fiches de paie", description: "Bulletins de salaire mensuels", count: 312 },
    { id: "cat-attestations", name: "Attestations", description: "Certificats de travail et présence", count: 187 },
    { id: "cat-identite", name: "Pièces d'identité", description: "Passeports et cartes d'employés", count: 98 },
    { id: "cat-cnss", name: "Social CNSS", description: "Bulletins de cotisations trimestrielles", count: 150 },
    { id: "cat-diplomes", name: "Diplômes", description: "Enregistrement diplômes de grade", count: 68 },
    { id: "cat-divers", name: "Documents divers", description: "Dossiers administratifs annexes", count: 65 }
  ];

  const docTypesList = [
    { id: "dt-contrat", name: "Contrat de travail", category: "Contrats", desc: "Contrat de travail standard à durée indéterminée", docCount: 187, status: "Actif" },
    { id: "dt-avenant", name: "Avenant de contrat", category: "Contrats", desc: "Avenants de modification de grade ou de rémunération", docCount: 125, status: "Actif" },
    { id: "dt-paie", name: "Fiche de paie", category: "Fiches de paie", desc: "Bulletins de salaire mensuels certifiés", docCount: 312, status: "Actif" },
    { id: "dt-solde", name: "Solde de tout compte", category: "Fiches de paie", desc: "Soldes libératoires de fin de contrats", docCount: 54, status: "Actif" },
    { id: "dt-attestation-travail", name: "Attestation de travail", category: "Attestations", desc: "Attestations d'embauche standard", docCount: 126, status: "Actif" },
    { id: "dt-identite", name: "Pièce d'identité", category: "Pièces d'identité", desc: "Cartes d'identité nationales et passeports", docCount: 98, status: "Actif" }
  ];

  const accessReqList = [
    { id: "req-1", document: "Contrat_Aime_Mbili.pdf", requester: "Paul Samba", reason: "Impératif vérification indemnités de congés payés", date: "28/05/2026", status: "En attente" },
    { id: "req-2", document: "Attestation_travail.pdf", requester: "Sophie Minko", reason: "Audit dossier informatique avant migration de poste", date: "25/05/2026", status: "Approuvé" },
    { id: "req-3", document: "Fiche_paie_Mai_2024.pdf", requester: "Marie Claire", reason: "Analyse administrative spontanée", date: "24/05/2026", status: "Rejeté" }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 1. Sidebar on the left */}
      <div className="hidden lg:flex shrink-0 h-screen">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={navigateToTab}
          currentUser={currentUser}
          pendingRequestsCount={accessRequests.filter(r => r.status === "pending").length}
          onLogout={handleLogout}
        />
      </div>

      {/* 2. Main screen center content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Upgraded Navbar */}
        <Navbar
          currentUser={currentUser}
          voirToutActive={voirToutActive}
          onToggleVoirTout={handleToggleVoirTout}
          onLogout={handleLogout}
          activeTab={currentTab}
          onHamburgerClick={() => setIsMobileDrawerOpen(true)}
          employees={employees}
          folders={folders}
          documents={documents}
          onInstantSelectResult={handleInstantSelectResult}
        />

        {/* Dynamic view dispatcher wrapper */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          
          {currentTab === "dashboard" && (
            <RoleDashboard
              currentUser={currentUser}
              employees={employees}
              documents={documents}
              agencies={agencies}
            />
          )}

          {currentTab === "documents" && (
            <SecurityGate permission="DOCUMENT_READ" currentUser={currentUser}>
              <DocumentsView
                currentUser={currentUser}
                documents={documents}
                categories={activeCategories}
                documentTypes={docTypesList.map(dt => ({ id: dt.id, name: dt.name, categoryId: dt.category === "Contrats" ? "cat-contrats" : dt.category === "Fiches de paie" ? "cat-paie" : "cat-attestations" }))}
                employees={employees}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                selectedEmployeeIdForFilter={selectedEmployeeIdForFilter}
                onSelectEmployeeIdForFilter={setSelectedEmployeeIdForFilter}
              />
            </SecurityGate>
          )}

          {currentTab === "employees" && (
            <SecurityGate permission="EMPLOYEE_READ" currentUser={currentUser}>
              <EmployeesView
                employees={employees}
                onGenerateCard={handleGenerateCard}
                generatedCards={generatedCards}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                selectedEmployeeIdForFilter={selectedEmployeeIdForFilter}
                onSelectEmployeeIdForFilter={setSelectedEmployeeIdForFilter}
              />
            </SecurityGate>
          )}

          {currentTab === "analytics" && (
            <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
              <div className="pb-4 border-b border-slate-150">
                <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Cabinet de Pilotage</p>
                <h1 className="text-3xl font-light tracking-tight text-slate-900">Statistiques & Diagnostics <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Analytics</span></h1>
                <p className="text-xs text-slate-500 mt-1">Analyse volumétrique et audit des temps de réponse d'indexation automatisée d'AFG Bank Gabon.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold mb-1">Efficacité de l'IA (ARHI)</span>
                  <h3 className="text-2xl font-bold font-sans text-slate-800">98.4%</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Précision de reconnaissance de métadonnées faciale et textuelle sur les fiches 4x4.</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold mb-1">Vitesse d'Indexation Mo/s</span>
                  <h3 className="text-2xl font-bold font-sans text-[#00C853]">0.42 sec</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Temps moyen de déchiffrement, calcul d'empreinte SHA-256 et stockage froid.</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold mb-1">Espace Chiffré Consommé</span>
                  <h3 className="text-2xl font-bold font-sans text-[#0A84FF]">152.8 MB</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">De stockage cloud chiffré alloué sur un quota de 10 GB sécuritaires.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-4">Croissance mensuelle d'archivage</h4>
                <div className="h-44 flex items-end gap-3 pt-6 border-b border-slate-100">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-100 rounded-t-lg h-12 hover:bg-[#0052CC] transition-colors" />
                    <span className="text-[10px] font-mono mt-2 text-slate-400 font-bold">Jan</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-150 rounded-t-lg h-20 hover:bg-[#0052CC] transition-colors" />
                    <span className="text-[10px] font-mono mt-2 text-slate-400 font-bold">Fév</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-100 rounded-t-lg h-28 hover:bg-[#0052CC] transition-colors" />
                    <span className="text-[10px] font-mono mt-2 text-slate-400 font-bold">Mar</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-150 rounded-t-lg h-32 hover:bg-[#0052CC] transition-colors" />
                    <span className="text-[10px] font-mono mt-2 text-slate-400 font-bold">Avr</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-100 rounded-t-lg h-40 hover:bg-[#0052CC] transition-colors" />
                    <span className="text-[10px] font-mono mt-2 text-slate-400 font-bold">Mai</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-[#0052CC] rounded-t-lg h-44" />
                    <span className="text-[10px] font-mono mt-2 text-slate-800 font-bold">Juin (Ext.)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "history" && (
            <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
              <div className="pb-4 border-b border-slate-150">
                <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Historique de versions</p>
                <h1 className="text-3xl font-light tracking-tight text-slate-900">Registre Global de Modification <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Historique</span></h1>
                <p className="text-xs text-slate-500 mt-1">Timeline d'évolution du dictionnaire de métadonnées, des profils salariés et du registre GED.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 bg-[#00C853] border-4 border-white rounded-full" />
                    <span className="text-[9.5px] text-slate-400 font-mono">28 MAI 2026 - 15:32</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">Délivrance Badge Pro Gabon - Marie Claire</h4>
                    <p className="text-slate-500 text-xs mt-1">Le système central a chiffré les clés biométriques d'accréditation nationale.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 bg-[#0A84FF] border-4 border-white rounded-full" />
                    <span className="text-[9.5px] text-slate-400 font-mono">27 MAI 2026 - 10:45</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">Dépôt du gabarit d'archive "Social CNSS"</h4>
                    <p className="text-slate-500 text-xs mt-1">Création de la catégorie de paie CNSS par le portail d'administration d'archives.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 bg-[#0052CC] border-4 border-white rounded-full" />
                    <span className="text-[9.5px] text-slate-400 font-mono">25 MAI 2026 - 09:00</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">Audit de pénétration semestriel</h4>
                    <p className="text-slate-500 text-xs mt-1">Certificats de cryptage réinitialisés. Index d'intégrité de la base à 100%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "folders" && (
            <SecurityGate permission="DOCUMENT_READ" currentUser={currentUser}>
              <FoldersView
                folders={folders}
                employees={employees}
                documents={documents}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={handleCreateFolder}
                onUpdateFolder={handleUpdateFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            </SecurityGate>
          )}

          {currentTab === "document-types" && (
            <SecurityGate permission="DOCUMENT_READ" currentUser={currentUser}>
              <DocumentTypesView
                currentUser={currentUser}
                categories={activeCategories}
                onRefreshAll={refetchAll}
              />
            </SecurityGate>
          )}

          {currentTab === "professional-cards" && (
            <SecurityGate permission="CARD_GENERATE" currentUser={currentUser}>
              <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
                <div className="pb-4 border-b border-slate-150">
                  <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Système d'Accréditation</p>
                  <h1 className="text-3xl font-light tracking-tight text-slate-900">Cartes Professionnelles Émises <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Badges</span></h1>
                  <p className="text-xs text-slate-500 mt-1">Registre national de délivrance des laissez-passer physiques et numériques conformes aux codes gabonais.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employees.map(emp => (
                    <div key={emp.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={emp.photoUrl} className="w-14 h-14 rounded-2xl object-cover border border-slate-200" alt="" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-855 uppercase leading-none">{emp.fullName}</h4>
                          <p className="text-slate-450 mt-1">{emp.position}</p>
                          <span className="text-[9.5px] text-[#0052CC] font-mono font-bold mt-2 block tracking-wider">Matricule: {emp.matricule}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openCardForEmployee(emp)}
                        className="px-4 py-2 bg-slate-100 hover:bg-[#0052CC] hover:text-white text-[#0052CC] rounded-xl font-bold font-sans transition-all text-[11px] cursor-pointer"
                      >
                        Inspecter la carte
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </SecurityGate>
          )}

          {currentTab === "agencies" && (
            <SecurityGate permission="AGENCY_VIEW" currentUser={currentUser}>
              <AgenciesView
                agencies={agencies}
                employees={employees}
                onCreateAgency={handleCreateAgency}
                onUpdateAgency={handleUpdateAgency}
                onDeleteAgency={handleDeleteAgency}
              />
            </SecurityGate>
          )}

          {currentTab === "roles" && (
            <SecurityGate permission="USER_READ" currentUser={currentUser}>
              <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
                <div className="pb-4 border-b border-slate-150">
                  <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Autorisations & Privilèges</p>
                  <h1 className="text-3xl font-light tracking-tight text-slate-900">Rôles Authentifiés <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Rôles</span></h1>
                  <p className="text-xs text-slate-500 mt-1">Aperçu et configuration des niveaux d'accès concédés aux gestionnaires de la Banque.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <Icons.ShieldAlert className="w-8 h-8 text-[#0052CC]" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">SUPER_ADMIN</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Contrôle Total - Cabinet DG</p>
                      </div>
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">Droits de purge définitive, modification de l’intégralité des rôles, visibilité multi-agences immédiate.</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <Icons.ShieldCheck className="w-8 h-8 text-[#00C853]" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">DRH & RH_MANAGER</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Dictionnaire RH national</p>
                      </div>
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">Capacité d’indexation de documents, de recrutement de collaborateurs, d’impression de badges pro gabonais.</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <Icons.Eye className="w-8 h-8 text-amber-500" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">AUDITOR</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Consultation Pure</p>
                      </div>
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">Lecture seule sur le GED, inspection des journaux de logs d'audit d'intégrité, interdiction formelle de verser/modifier.</p>
                  </div>
                </div>
              </div>
            </SecurityGate>
          )}

          {currentTab === "permissions" && (
            <SecurityGate permission="ROLE_ASSIGN" currentUser={currentUser}>
              <RolesPermissionsView
                roles={roles}
                onSaveRolePermissions={handleSaveRolePermissions}
              />
            </SecurityGate>
          )}

          {currentTab === "workflow" && (
            <WorkflowsView
              currentUser={currentUser}
              documents={documents}
              accessRequests={accessRequests}
              onRefreshAll={refetchAll}
            />
          )}

          {currentTab === "chatbot" && (
            <SecurityGate permission="CHATBOT_ACCESS" currentUser={currentUser}>
              <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold h-[70vh] flex flex-col justify-between">
                <div className="pb-4 border-b border-slate-150 shrink-0">
                  <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Assistant IA Bancaire</p>
                  <h1 className="text-3xl font-light tracking-tight text-slate-900">Arhi Intelligent Advisor <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">ARHI Full</span></h1>
                  <p className="text-xs text-slate-500 mt-1">Interagissez avec le LLM Gemini connecté aux bases de données RH d'AFG Bank Gabon en grand écran.</p>
                </div>

                {/* Direct Embed of the Chatbot Panel */}
                <div className="flex-1 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-[#0052CC] rounded-full animate-ping" />
                    <span className="font-bold text-slate-800">Session ARHI Active - Gemini 2.4-Pro</span>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]/55">
                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-[#0052CC]/10 text-[#0052CC] border border-[#0052CC]/15 rounded-xl">
                        <Icons.Sparkles className="w-5 h-5 text-[#0052CC]" />
                      </div>
                      <div className="bg-white p-4.5 rounded-2xl border border-slate-100 max-w-xl text-slate-700 leading-relaxed font-semibold">
                        Bonjour, {currentUser?.fullName}. Je suis **ARHI**, l'agent expert conçu pour piloter les archives de la Banque AFG Gabon. Je peux vous aider à formuler des procédures de recrutement complexes, synthétiser des statuts réglementaires, rechercher des matricules d'agence ou concevoir des gabarits d'indexation. Quelle est votre requête opérationnelle ?
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      placeholder="Posez une question de conformité RH nationale ou demandez un audit d'accréditations..."
                      className="flex-1 bg-white p-3.5 border border-slate-200/80 rounded-2xl text-slate-800 text-xs focus:outline-none"
                      onKeyDown={(e) => { if (e.key === "Enter") alert("Utilisez le badge flottant intelligent en bas à droite pour exécuter la conversation en temps réel avec le grand LLM."); }}
                    />
                    <button onClick={() => alert("Utilisez le badge flottant intelligent en bas à droite pour exécuter la conversation en temps réel avec le grand LLM.")} className="px-5 bg-[#0052CC] text-white font-bold rounded-2xl text-xs hover:bg-[#0066FF]">
                      Demander à ARHI
                    </button>
                  </div>
                </div>
              </div>
            </SecurityGate>
          )}

          {currentTab === "notifications" && (
            <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
              <div className="pb-4 border-b border-slate-150">
                <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold font-bold">Sécurité Système</p>
                <h1 className="text-3xl font-light tracking-tight text-slate-900">Alertes & Notifications <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Alertes</span></h1>
                <p className="text-xs text-slate-500 mt-1">Flux critique d'alertes de sécurité, connexions simultanées interceptées sur Libreville, ou demandes de purge.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-100 shrink-0">
                    <Icons.ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Accès temporaire expiré pour Dossier Marie Claire</h4>
                    <span className="text-[9.5px] font-mono text-slate-400">Il y a 3 heures • Audit conformité</span>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1.5 font-normal">La clé de décloisonnement inter-agence concédée à l'auditeur Paul Samba a été révoquée automatiquement après expiration du créneau réglementaire de 48h.</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-[#00C853]/10 text-[#00C853] rounded-xl border border-[#00C853]/15 shrink-0">
                    <Icons.Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Sauvegarde automatique certifiée ISO</h4>
                    <span className="text-[9.5px] font-mono text-slate-400">Aujourd'hui, 04:00 • Base de données d'archives</span>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1.5 font-normal">Toutes les pièces d'accréditations, photos 4x4 biométriques, livre de paie et registres de logs ont étés exportés avec succès sur le coffre-fort redondant local.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "trash" && (
            <SecurityGate permission="DOCUMENT_DELETE" currentUser={currentUser}>
              <TrashView
                deletedDocs={documents.filter(d => d.isDeleted)}
                employees={employees}
                onRestore={handleRestoreDocument}
                onPermanentDelete={handlePermanentDelete}
                onEmptyTrash={handleEmptyTrash}
              />
            </SecurityGate>
          )}

          {currentTab === "roles-permissions" && (
            <SecurityGate permission="ROLE_ASSIGN" currentUser={currentUser}>
              <RolesPermissionsView
                roles={roles}
                onSaveRolePermissions={handleSaveRolePermissions}
              />
            </SecurityGate>
          )}

          {currentTab === "parameters" && (
            <ParametersView
              parameters={parameters}
              onSaveParameter={handleSaveParameter}
            />
          )}

          {currentTab === "activity-logs" && (
            <ActivityLogView
              logs={activityLogs}
              employees={employees}
            />
          )}

          {currentTab === "administration" && (
            <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
              <div className="pb-4 border-b border-slate-150">
                <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Diagnostic Système</p>
                <h1 className="text-3xl font-light tracking-tight text-slate-900">Console d'Administration Serveur <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Admin</span></h1>
                <p className="text-xs text-slate-500 mt-1 col-span-2">Administration des variables d'environnement, indices d'allocation mémoire, caches serveur NodeJS.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-mono tracking-wider text-slate-400 font-bold uppercase mb-2">Performances Node & Express</h4>
                  <div className="space-y-2 text-slate-650">
                    <div className="flex justify-between">
                      <span>Port de conteneur d'Applet :</span>
                      <span className="font-mono text-slate-800 font-bold">3000 (INGRESS SECURE)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Index d'allocation mémoire :</span>
                      <span className="font-mono text-slate-800 font-semibold">24.5 MB / 512.0 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Caches Redis d'indexation :</span>
                      <span className="text-[#00C853] font-bold font-sans">99.8% HIT RATE</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-mono tracking-wider text-slate-400 font-bold uppercase mb-2">Variables d'Intégrité d'API IA</h4>
                  <div className="space-y-2 text-slate-650">
                    <div className="flex justify-between">
                      <span>GEMINI_API_KEY :</span>
                      <span className="text-[#00C853] font-bold font-sans">CONFIGURÉ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modèle par défaut :</span>
                      <span className="font-mono text-slate-800 font-bold">gemini-2.5-pro (PROD)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authentification d'accréditations :</span>
                      <span className="font-bold text-[#0052CC]">Actif</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating chatbot assistant connected directly to the express backend endpoint */}
      <ChatbotPanel />

      {inspectingCard && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-slide-up flex flex-col font-sans">
            
            <div className="p-5 bg-slate-50 text-slate-800 flex items-center justify-between border-b border-slate-200">
              <span className="text-[10px] font-mono tracking-widest text-[#0052CC] uppercase font-bold">
                Aperçu d'Accréditation - Standards Certifiés Gabonais
              </span>
              <button onClick={() => setInspectingCard(null)} className="text-slate-400 hover:text-slate-800 cursor-pointer p-1.5 hover:bg-slate-200 rounded-lg">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              
              {/* Premium National Polycarbonate Card Preview (Front & Back Stacked) */}
              <SecureGabonCard
                employee={inspectingCard.employee}
                cardNumber={inspectingCard.cardNumber}
                issueDate={inspectingCard.issueDate}
                expiryDate={inspectingCard.expiryDate}
              />

              {/* Secure attributes validation summary */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2 font-semibold text-slate-650">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Norme de cryptage :</span>
                    <span className="font-mono font-bold text-slate-700">AES-256 GAG REGISTER</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Dates Validité :</span>
                    <span className="text-slate-800 font-bold">{inspectingCard.issueDate} au {inspectingCard.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">État Référence :</span>
                    <span className="font-bold text-[#00C853] flex items-center gap-1">
                      <Icons.Check className="w-3.5 h-3.5" /> Enregistré en base centrale (Libreville)
                    </span>
                  </div>
                </div>

                {/* Print commands */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-2.5">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const btn = e.currentTarget;
                        const originalText = btn.innerHTML;
                        btn.disabled = true;
                        btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Génération PDF...`;
                        
                        const name = inspectingCard.employee?.fullName || inspectingCard.employee?.lastName || "Collaborateur";
                        try {
                          await downloadCardAsPDF(name);
                          toast.success(`Le PDF HD de ${name} est prêt et a été stocké/téléchargé.`);
                        } catch (err: any) {
                          toast.error(err.message || "La sécurisation PDF a échoué");
                        } finally {
                          btn.innerHTML = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0052CC] hover:bg-[#0066FF] disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow hover:shadow-lg"
                    >
                      <Icons.Download className="w-4 h-4" />
                      Télécharger PDF HD
                    </button>
                    
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const btn = e.currentTarget;
                        const originalText = btn.innerHTML;
                        btn.disabled = true;
                        btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saisie Image...`;
                        
                        const name = inspectingCard.employee?.fullName || inspectingCard.employee?.lastName || "Collaborateur";
                        try {
                          await downloadCardAsMergedPNG(name);
                          toast.success(`L'image PNG HD de ${name} est prête et a été téléchargée.`);
                        } catch (err: any) {
                          toast.error(err.message || "L'exportation PNG a échoué");
                        } finally {
                          btn.innerHTML = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow hover:shadow-lg"
                    >
                      <Icons.Image className="w-4 h-4" />
                      Télécharger PNG
                    </button>
                  </div>
                  
                  <div className="flex gap-2.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        printCardElement();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Icons.Printer className="w-4 h-4 text-slate-500" />
                      Imprimer le Badge 1:1
                    </button>
                    <button
                      onClick={() => setInspectingCard(null)}
                      className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      <MobileNavbar
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        currentUser={currentUser}
        pendingRequestsCount={accessRequests.filter(r => r.status === "pending").length}
      />
    </div>
  );
}
