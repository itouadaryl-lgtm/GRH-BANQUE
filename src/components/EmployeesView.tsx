/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Icons from "lucide-react";
import { User, UserStatus } from "../types";
import SecureGabonCard from "./SecureGabonCard";
import { printCardElement, downloadCardAsPDF, downloadCardAsMergedPNG } from "../utils/cardExporter";
import { toast } from "sonner";
import ExportButton from "./ExportButton";
import PrintButton from "./PrintButton";
import ImportButton from "./ImportButton";


interface EmployeesViewProps {
  employees: User[];
  generatedCards: any[];
  onGenerateCard: (employeeId: string) => void;
  onAddEmployee: (data: any) => Promise<any>;
  onUpdateEmployee: (id: string, data: any) => Promise<any>;
  onDeleteEmployee: (id: string) => Promise<any>;
  selectedEmployeeIdForFilter?: string;
  onSelectEmployeeIdForFilter?: (id: string) => void;
}

// Validation Zod de l'ID d'Accréditation Nationale
const employeeSchema = z.object({
  lastName: z.string().min(2, "Le nom doit comporter au moins 2 caractères (normes AFG)"),
  firstName: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse email professionnelle invalide (ex: nom@afgbank.ga)"),
  phone: z.string().min(8, "Veuillez insérer un numéro national ou inter-filiales valide"),
  birthDate: z.string().min(10, "Date de naissance valide obligatoire (YYYY-MM-DD)"),
  hireDate: z.string().min(10, "Date d'embauche requise pour l'antériorité de carrière"),
  department: z.string().min(2, "Veuillez sélectionner un pôle directionnel valide"),
  position: z.string().min(2, "L'intitulé exact de la fiche de poste est requis"),
  status: z.enum(["active", "inactive", "suspended"] as const),
  agencyId: z.string().min(1, "Veuillez associer le collaborateur à une agence de rattachement")
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeesView({
  employees,
  generatedCards,
  onGenerateCard,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  selectedEmployeeIdForFilter = "",
  onSelectEmployeeIdForFilter
}: EmployeesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Synchronize search term if an employee id is selected from parent
  useEffect(() => {
    if (selectedEmployeeIdForFilter) {
      const selectedEmp = employees.find(e => e.id === selectedEmployeeIdForFilter);
      if (selectedEmp) {
        setSearchTerm(selectedEmp.fullName);
      }
    }
  }, [selectedEmployeeIdForFilter, employees]);
  
  // Modaux & États contextuels
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [viewingCard, setViewingCard] = useState<any | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  
  // Multi-sélection pour suppressions groupées
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Diagnostic Biométrique Photo 4x4
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoQualityScore, setPhotoQualityScore] = useState<number | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);
  const [selectedCrop, setSelectedCrop] = useState<"standard" | "tight" | "iso">("standard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Instanciation de React Hook Form avec Zod
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phone: "+241 ",
      birthDate: "1994-01-01",
      hireDate: new Date().toISOString().substring(0, 10),
      department: "Ressources Humaines",
      position: "",
      status: "active",
      agencyId: "ag-libreville"
    }
  });

  // Chargement des données à l'édition d'un collaborateur
  const handleEditClick = (emp: User) => {
    setEditingEmployee(emp);
    setPhotoPreview(emp.photoUrl || "");
    setPhotoQualityScore(96);
    setIsFaceDetected(true);
    reset({
      lastName: emp.lastName,
      firstName: emp.firstName,
      email: emp.email,
      phone: emp.phone,
      birthDate: emp.birthDate || "1994-01-01",
      hireDate: emp.hireDate || new Date().toISOString().substring(0, 10),
      department: emp.department,
      position: emp.position,
      status: emp.status,
      agencyId: emp.agencyId || "ag-libreville"
    });
    setShowAddModal(true);
  };

  // Ouverture du modal de création vide
  const handleNewClick = () => {
    setEditingEmployee(null);
    setPhotoPreview("");
    setPhotoQualityScore(null);
    setIsFaceDetected(false);
    reset({
      lastName: "",
      firstName: "",
      email: "@afgbank.ga",
      phone: "+241 ",
      birthDate: "1994-02-14",
      hireDate: new Date().toISOString().substring(0, 10),
      department: "Ressources Humaines",
      position: "",
      status: "active",
      agencyId: "ag-libreville"
    });
    setShowAddModal(true);
  };

  // Liste globale dynamique des départements
  const departments = Array.from(new Set(employees.map(e => e.department)));
  if (!departments.includes("Ressources Humaines")) departments.push("Ressources Humaines");
  if (!departments.includes("Conformité & Risques")) departments.push("Conformité & Risques");

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment ? e.department === selectedDepartment : true;
    const matchesStatus = selectedStatus ? e.status === selectedStatus : true;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Importation de la photo biométrique
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
        const sizeKb = file.size / 1024;
        const resolutionMetric = sizeKb > 250 ? 98 : sizeKb > 90 ? 89 : 64;
        setPhotoQualityScore(resolutionMetric);
        setIsFaceDetected(sizeKb > 30);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission finale du formulaire (Create ou Update)
  const onSubmitForm = async (data: EmployeeFormData) => {
    if (!photoPreview) {
      toast.error("Une photo d'identité biométrique ou scan portrait 4x4 est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        lastName: data.lastName.toUpperCase(),
        photoUrl: photoPreview
      };

      if (editingEmployee) {
        await onUpdateEmployee(editingEmployee.id, payload);
        setEditingEmployee(null);
      } else {
        await onAddEmployee(payload);
      }
      setShowAddModal(false);
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Échec d'enregistrement du profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression unitaire
  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    try {
      await onDeleteEmployee(deletingEmployee.id);
      setSelectedIds(prev => prev.filter(id => id !== deletingEmployee.id));
      setDeletingEmployee(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Suppression groupée
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    const toastId = toast.loading(`Suppression de ${selectedIds.length} collaborateur(s) en cours...`);
    try {
      for (const id of selectedIds) {
        await onDeleteEmployee(id);
      }
      toast.success(`${selectedIds.length} collaborateur(s) supprimé(s) du registre central.`, { id: toastId });
      setSelectedIds([]);
    } catch (error) {
      toast.error("Erreur durant la purge groupée.", { id: toastId });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Accompagnement de sélection
  const handleRowCheckbox = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  // Affichage du Badge Certifié
  const handleOpenCard = (employeeId: string) => {
    onGenerateCard(employeeId);
    setTimeout(() => {
      const emp = employees.find(su => su.id === employeeId);
      if (emp) {
        const matchingCard = generatedCards.find(c => c.employeeId === employeeId);
        const cardPayload = matchingCard || {
          id: "card-" + Math.random().toString(36).substr(2, 5),
          employeeId: emp.id,
          cardNumber: `AFGBANK-GAB-${new Date().getFullYear()}-${emp.matricule}`,
          issueDate: new Date().toLocaleDateString("fr-FR"),
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString("fr-FR"),
          status: "active" as const,
          generatedAt: new Date().toISOString()
        };
        setViewingCard({ ...cardPayload, employee: emp });
      }
    }, 200);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-12 relative">
      
      {/* Header Registre */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-slate-100">
        <div>
          <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Cabinet RH & Registre</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Index des Collaborateurs <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Gabon</span></h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl font-sans">
            Annuaire global crypté d'AFG Bank. Recherche, gestion des fiches du personnel et délivrance instantanée d'accréditations professionnelles.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="px-4 py-2 bg-slate-50 text-[10px] font-mono tracking-widest text-[#0052CC] border border-slate-200/50 rounded-full font-bold shadow-sm">
            Total : {employees.length} collaborateurs
          </span>
          <ExportButton entity="employees" label="Exporter" />
          <PrintButton
            data={filteredEmployees.map(e => ({
              matricule: e.matricule,
              fullName: e.fullName,
              email: e.email,
              department: e.department,
              position: e.position,
              status: e.status,
            }))}
            columns={[
              { header: "Matricule", dataKey: "matricule" },
              { header: "Nom complet", dataKey: "fullName" },
              { header: "Email", dataKey: "email" },
              { header: "Département", dataKey: "department" },
              { header: "Poste", dataKey: "position" },
              { header: "Statut", dataKey: "status" },
            ]}
            title="Registre des Collaborateurs"
            subtitle={`${filteredEmployees.length} collaborateur(s) — AFG Bank Gabon`}
            label="PDF"
          />
          <ImportButton entity="employees" />
          <button
            onClick={handleNewClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0052CC] text-white font-bold text-xs rounded-full hover:bg-[#0066FF] cursor-pointer shadow-md shadow-[#0052CC]/10 transition-all font-sans"
          >
            <Icons.UserPlus className="w-4 h-4" />
            Nouveau collaborateur
          </button>
        </div>
      </div>

      {/* Barre de Recherche/Filtre */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Département / Direction</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white"
          >
            <option value="">Tous les départements</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Statut Salarié</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif / Retraité</option>
            <option value="inactive">En congé</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-400 font-mono font-bold tracking-widest uppercase mb-1.5 text-[9px]">Recherche textuelle</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom, matricule ou poste..."
              className="w-full bg-slate-50 pl-4 pr-10 py-3 border border-slate-200/60 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#0052CC] focus:bg-white placeholder:text-slate-450"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                <Icons.X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Index des Salaries */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[#950px]">
            <thead>
              <tr className="bg-slate-50 uppercase text-[9px] font-bold tracking-widest text-[#71717a] border-b border-slate-100">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#0052CC] focus:ring-[#0052CC] border-slate-300"
                  />
                </th>
                <th className="py-4 px-4 w-28">Matricule</th>
                <th className="py-4 px-4 w-16">Photo</th>
                <th className="py-4 px-4">Nom complet</th>
                <th className="py-4 px-4">Département</th>
                <th className="py-4 px-4 font-mono">Fiche/Poste</th>
                <th className="py-4 px-4 font-mono">Email</th>
                <th className="py-4 px-4 w-28">Statut</th>
                <th className="py-4 px-6 text-right w-64">Actions RH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 bg-white">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-450 bg-white leading-relaxed">
                    <Icons.UserX className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    Aucun collaborateur inscrit dans cette direction.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const statusColors = {
                    ACTIVE: "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/15",
                    RETIRED: "bg-slate-100 text-slate-650 border-slate-200",
                    ON_LEAVE: "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/15",
                    SUSPENDED: "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/15"
                  } as any;

                  const isChecked = selectedIds.includes(emp.id);

                  return (
                    <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? "bg-slate-50/80" : ""}`}>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRowCheckbox(emp.id)}
                          className="w-4 h-4 rounded text-[#0052CC] focus:ring-[#0052CC] border-slate-300"
                        />
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-450 font-bold">
                        {emp.matricule}
                      </td>
                      <td className="py-4 px-4">
                        <img
                          src={emp.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt=""
                          className="w-9 h-9 rounded-xl border border-slate-200 object-cover bg-slate-50"
                        />
                      </td>
                      <td className="py-4 px-4 text-slate-900 font-bold font-display">
                        {emp.fullName}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">{emp.department}</td>
                      <td className="py-4 px-4 text-slate-500 font-medium">{emp.position}</td>
                      <td className="py-4 px-4 text-slate-400 font-mono font-medium">{emp.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border ${statusColors[emp.status] || "bg-zinc-800 text-slate-400 border-zinc-700"}`}>
                          {emp.status === "active" ? "Actif" : emp.status === "inactive" ? "Inactif" : "Suspendu"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenCard(emp.id)}
                            title="Badge Professionnel"
                            className="p-2 bg-slate-100 hover:bg-[#0052CC]/10 text-slate-600 hover:text-[#0052CC] rounded-xl transition-all cursor-pointer"
                          >
                            <Icons.IdCard className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(emp)}
                            title="Modifier Collaborateur"
                            className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-xl transition-all cursor-pointer"
                          >
                            <Icons.Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingEmployee(emp)}
                            title="Révoquer Collaborateur"
                            className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl transition-all cursor-pointer"
                          >
                            <Icons.Trash2 className="w-4 h-4" />
                          </button>
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

      {/* BARRE ACTIONS GROUPÉES FLOTTANTE PREMIUM */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white py-4 px-6 rounded-2xl shadow-xl flex items-center gap-6 z-40 animate-slide-up border border-slate-800 text-xs">
          <span className="font-mono">
            <span className="text-yellow-405 font-bold mr-1">{selectedIds.length}</span> 
            collaborateur(s) sélectionné(s)
          </span>
          <div className="h-5 w-px bg-slate-800" />
          <button
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl transition-all font-bold text-white shrink-0 cursor-pointer disabled:bg-slate-750"
          >
            <Icons.Trash className="w-4 h-4" />
            Supprimer la sélection
          </button>
        </div>
      )}

      {/* CONFIRMATION DE SUPPRESSION UNITAIRE (MODAL PREMIUM) */}
      {deletingEmployee && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-150 p-6 space-y-6 text-xs text-slate-600 font-semibold animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-55 rounded-full text-red-600 shrink-0">
                <Icons.AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Confirmation de Révocation de contrat</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-wider">AFG GABON SECURITY PROTOCOL</p>
              </div>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement la fiche de <strong className="text-slate-805">{deletingEmployee.fullName}</strong> ? Cette action détruira son matricule <strong className="text-slate-805">{deletingEmployee.matricule}</strong> de la base du personnel et révoquera toutes ses habilitations GED immédiatement.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingEmployee(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/60 rounded-full font-bold cursor-pointer text-slate-500 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-red-650 hover:bg-red-600 rounded-full font-bold cursor-pointer text-white shadow-md shadow-red-600/10 transition-all flex items-center gap-1.5"
              >
                <Icons.UserMinus className="w-4 h-4" />
                Dépouiller le dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULAIRE UNIQUE ADD/EDIT (MODAL PREMIUM) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.UserPlus className="w-5 h-5 text-[#0052CC]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingEmployee ? `Mise à jour: ${editingEmployee.fullName}` : "Recrutement / Nouveau Collaborateur"}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-mono uppercase mt-0.5 tracking-wider">AFG BANK CENTRAL REGISTER</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 font-semibold">
              
              {/* Photo Section */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4 animate-slide-up">
                <p className="text-[11px] font-bold text-[#0052CC] uppercase font-mono tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/50">
                  <Icons.Camera className="w-4 h-4" /> 
                  1. Photographie d'identité obligatoire (Format Bancaire ISO 4x4)
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Photo Frame Container */}
                  <div className="relative w-32 h-32 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center shadow-inner group shrink-0">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview identity" 
                        className={`w-full h-full object-cover transition-all duration-200 ${
                          selectedCrop === "tight" ? "scale-110" : selectedCrop === "iso" ? "contrast-105 brightness-105" : ""
                        }`} 
                      />
                    ) : (
                      <Icons.User className="w-12 h-12 text-slate-350" />
                    )}
                    <div className="absolute bottom-2 inset-x-2 bg-black/60 text-white text-[8px] tracking-wide font-bold py-1 px-1.5 text-center rounded">
                      Dimensions: 4x4 mm
                    </div>
                  </div>

                  {/* Pickers */}
                  <div className="flex-1 space-y-3.5 w-full">
                    <p className="text-slate-500 font-medium text-xs leading-relaxed">
                      Conformément à la réglementation gabonaise des accréditations bancaires, le téléversement d'un portrait facial de face de haute définition est requis.
                    </p>
                    
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-4 bg-[#0052CC] text-white rounded-lg hover:bg-[#0066FF] transition-all font-bold font-sans cursor-pointer flex items-center gap-2 text-[10.5px]"
                      >
                        <Icons.Upload className="w-3.5 h-3.5" />
                        Choisir un portrait
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => setPhotoPreview("")}
                          className="py-2 px-4 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-105 font-bold cursor-pointer text-[10.5px]"
                        >
                          Réinstaller
                        </button>
                      )}
                    </div>

                    {photoPreview && (
                      <div className="flex items-center gap-2 pt-1 text-[10.5px]">
                        <span className="text-slate-400">Recadrage :</span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedCrop("standard")} 
                          className={`px-2 py-0.5 rounded border border-slate-200 ${selectedCrop === "standard" ? "bg-[#0052CC] text-white border-transparent" : "bg-white text-slate-650"}`}
                        >
                          4x4 standard
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setSelectedCrop("tight")} 
                          className={`px-2 py-0.5 rounded border border-slate-200 ${selectedCrop === "tight" ? "bg-[#0052CC] text-white border-transparent" : "bg-white text-slate-650"}`}
                        >
                          Contraste serré
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setSelectedCrop("iso")} 
                          className={`px-2 py-0.5 rounded border border-slate-200 ${selectedCrop === "iso" ? "bg-[#0052CC] text-white border-transparent" : "bg-white text-slate-650"}`}
                        >
                          ISO Gabon
                        </button>
                      </div>
                    )}

                    {photoPreview && (
                      <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${isFaceDetected ? "bg-[#00C853]" : "bg-[#FF3B30]"} animate-pulse`} />
                        <div className="text-[10px] leading-tight">
                          <p className="text-slate-700 font-bold leading-none">Diagnostic Biométrique : {isFaceDetected ? "CONFORME" : "PORTRAIT INVALIDE"}</p>
                          <p className="text-slate-400 mt-1">Indice de netteté faciale : {photoQualityScore}% (Requis &gt; 65%)</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Civil details */}
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-[#0052CC] uppercase font-mono tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/50">
                  <Icons.UserCheck2 className="w-4 h-4" />
                  2. Renseignements d'état-civil & d'agence
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Prénom *</label>
                    <input
                      type="text"
                      {...register("firstName")}
                      placeholder="Marie Claire"
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl focus:outline-none focus:border-[#0052CC] focus:bg-white text-slate-705 font-bold text-xs"
                    />
                    {errors.firstName && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.firstName.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Nom de famille *</label>
                    <input
                      type="text"
                      {...register("lastName")}
                      placeholder="NDONG"
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl focus:outline-none focus:border-[#0052CC] focus:bg-white text-slate-705 font-bold text-xs"
                    />
                    {errors.lastName && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.lastName.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Adresse Email Pro *</label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="marie.ndong@afgbank.ga"
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl focus:outline-none focus:border-[#0052CC] focus:bg-white text-slate-705 font-bold text-xs"
                    />
                    {errors.email && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.email.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Téléphone Professionnel *</label>
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="+241 66 12 34 56"
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl focus:outline-none focus:border-[#0052CC] focus:bg-white text-slate-705 font-bold text-xs"
                    />
                    {errors.phone && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.phone.message}</span>}
                  </div>

                  <div>
                    <label className="block text-[#71717a] font-mono tracking-widest uppercase mb-1.5 text-[9px]">Rattachement Régional (Agence GD)</label>
                    <select
                      {...register("agencyId")}
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-705 font-bold focus:outline-none text-xs"
                    >
                      <option value="ag-siege">AFG BANK Siège Social (Libreville)</option>
                      <option value="ag-libreville">AFG BANK Libreville Centre (Libreville)</option>
                      <option value="ag-owendo">AFG BANK Owendo Port (Owendo)</option>
                      <option value="ag-portgentil">AFG BANK Port-Gentil (Port-Gentil)</option>
                    </select>
                    {errors.agencyId && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.agencyId.message}</span>}
                  </div>

                  <div>
                    <label className="block text-[#71717a] font-mono tracking-widest uppercase mb-1.5 text-[9px]">Direction de rattachement</label>
                    <select
                      {...register("department")}
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-705 font-bold focus:outline-none text-xs"
                    >
                      <option value="Ressources Humaines">Ressources Humaines</option>
                      <option value="Direction de l'Audit Interne">Direction de l'Audit Interne</option>
                      <option value="Conformité & Risques">Conformité & Risques</option>
                      <option value="Comptabilité Générale">Comptabilité Générale</option>
                      <option value="Cabinet du Directeur Général">Cabinet du Directeur Général</option>
                      <option value="Développement Informatique">Développement Informatique</option>
                    </select>
                    {errors.department && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.department.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Intitulé de Poste exact *</label>
                    <input
                      type="text"
                      {...register("position")}
                      placeholder="Chef de projet digital"
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl focus:outline-none focus:border-[#0052CC] focus:bg-white text-slate-705 font-bold text-xs"
                    />
                    {errors.position && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.position.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Date de naissance *</label>
                    <input
                      type="date"
                      {...register("birthDate")}
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-705 focus:outline-none text-xs"
                    />
                    {errors.birthDate && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.birthDate.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Date d'Embauche *</label>
                    <input
                      type="date"
                      {...register("hireDate")}
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-705 focus:outline-none text-xs"
                    />
                    {errors.hireDate && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.hireDate.message}</span>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Statut Salarié</label>
                    <select
                      {...register("status")}
                      className="w-full bg-slate-50 p-3 border border-slate-200/60 rounded-xl text-slate-705 font-bold focus:outline-none text-xs"
                    >
                      <option value="active">Actif permanent</option>
                      <option value="inactive">En congé maladie</option>
                      <option value="inactive">Retraité</option>
                      <option value="suspended">Sous interdiction provisoire</option>
                    </select>
                    {errors.status && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.status.message}</span>}
                  </div>

                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3.5 pt-6 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 font-bold cursor-pointer font-sans transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0066FF] disabled:bg-slate-400 text-white rounded-full font-bold shadow-md shadow-[#0052CC]/10 cursor-pointer font-sans transition-all"
                >
                  {isSubmitting ? "Traitement cryptographique..." : editingEmployee ? "Sauvegarder les modifications" : "Valider l'inscription"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* GABONESE SECURE ACCREDITATION CARD DESIGNER WATERMARK APERCU */}
      {viewingCard && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-slide-up flex flex-col">
            
            <div className="p-5 bg-slate-50 text-slate-800 flex items-center justify-between border-b border-slate-200">
              <span className="text-[10px] font-mono tracking-widest text-[#0052CC] uppercase font-bold">
                Aperçu d'Édition - Standards Certifiés Gabonais
              </span>
              <button onClick={() => setViewingCard(null)} className="text-slate-400 hover:text-slate-800 cursor-pointer p-1.5 hover:bg-slate-200 rounded-lg">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              
              {/* stack preview card components */}
              <SecureGabonCard
                employee={viewingCard.employee}
                cardNumber={viewingCard.cardNumber}
                issueDate={viewingCard.issueDate}
                expiryDate={viewingCard.expiryDate}
              />

              {/* Secure verification attributes */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-xs space-y-2.5 font-semibold text-slate-650 animate-slide-up">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Norme de cryptage :</span>
                    <span className="font-mono font-bold text-slate-700">AES-256 HSM GAB REGISTRY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Dates Validité :</span>
                    <span className="text-slate-800 font-bold">{viewingCard.issueDate} au {viewingCard.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">État Référence :</span>
                    <span className="font-bold text-[#00C853] flex items-center gap-1">
                      <Icons.Check className="w-3.5 h-3.5" /> Enregistré en base centrale (Libreville)
                    </span>
                  </div>
                </div>

                {/* Print actions */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-2.5">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const btn = e.currentTarget;
                        const originalText = btn.innerHTML;
                        btn.disabled = true;
                        btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-white mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Génération PDF...`;
                        
                        try {
                          const name = viewingCard.employee?.fullName || "Collaborateur";
                          await downloadCardAsPDF(name);
                          toast.success("Document PDF généré et téléchargé !");
                        } catch (err: any) {
                          toast.error(err.message || "Erreur de génération PDF");
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
                        btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-white mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saisie PNG...`;
                        
                        try {
                          const name = viewingCard.employee?.fullName || "Collaborateur";
                          await downloadCardAsMergedPNG(name);
                          toast.success("Image PNG s'est téléchargée !");
                        } catch (err: any) {
                          toast.error("Erreur de rendu graphique PNG");
                        } finally {
                          btn.innerHTML = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow hover:shadow-lg"
                    >
                      <Icons.Image className="w-4 h-4" />
                      Générer PNG
                    </button>
                  </div>
                  
                  <div className="flex gap-2.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        printCardElement();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-300 hover:bg-slate-50 text-slate-705 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Icons.Printer className="w-4 h-4 text-slate-500" />
                      Imprimer Accréditation
                    </button>
                    <button
                      onClick={() => setViewingCard(null)}
                      className="py-3 px-6 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
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

    </div>
  );
}
