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

interface Agency {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  isHeadOffice: boolean;
  isActive: boolean;
}

interface AgenciesViewProps {
  agencies: Agency[];
  employees: any[];
  onCreateAgency: (data: any) => Promise<any>;
  onUpdateAgency: (id: string, data: any) => Promise<any>;
  onDeleteAgency: (id: string) => Promise<any>;
}

const agencySchema = z.object({
  code: z.string().min(2, "Le code de l'agence doit comporter au moins 2 caractères"),
  name: z.string().min(3, "Le nom officiel de l'agence est obligatoire"),
  address: z.string().min(3, "L'adresse physique gabonaise est requise"),
  city: z.string().min(2, "La ville d'affectation est requise"),
  phone: z.string().min(8, "Le numéro de contact est requis"),
  email: z.string().email("Format d'adresse e-mail d'agence incorrect"),
  isHeadOffice: z.boolean(),
  isActive: z.boolean()
});

type AgencyFormData = z.infer<typeof agencySchema>;

export default function AgenciesView({
  agencies,
  employees,
  onCreateAgency,
  onUpdateAgency,
  onDeleteAgency
}: AgenciesViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      city: "Libreville",
      phone: "+241 11 ",
      email: "@afgbank.ga",
      isHeadOffice: false,
      isActive: true
    }
  });

  const handleCreateNewClick = () => {
    setEditingAgency(null);
    reset({
      code: `AG-${Date.now().toString().slice(-4)}`,
      name: "",
      address: "",
      city: "Libreville",
      phone: "+241 11 ",
      email: "@afgbank.ga",
      isHeadOffice: false,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditClick = (agency: Agency) => {
    setEditingAgency(agency);
    reset({
      code: agency.code,
      name: agency.name,
      address: agency.address,
      city: agency.city,
      phone: agency.phone,
      email: agency.email,
      isHeadOffice: agency.isHeadOffice,
      isActive: agency.isActive
    });
    setShowModal(true);
  };

  const onSubmitForm = async (data: AgencyFormData) => {
    setIsSubmitting(true);
    try {
      if (editingAgency) {
        await onUpdateAgency(editingAgency.id, data);
        toast.success(`L'agence ${data.name} a été mise à jour !`);
      } else {
        await onCreateAgency(data);
        toast.success(`L'agence ${data.name} a été créée avec succès !`);
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de traitement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAgency) return;
    try {
      await onDeleteAgency(deletingAgency.id);
      toast.success(`L'agence ${deletingAgency.name} a été supprimée du réseau.`);
      setDeletingAgency(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de suppression.");
    }
  };

  // Calcule les effectifs réels liés à chaque agence
  const getEmployeeCountForAgency = (agencyId: string) => {
    return employees.filter(e => e.agencyId === agencyId).length;
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12 font-sans text-xs font-semibold">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-150 flex justify-between items-end">
        <div>
          <p className="text-[#0052CC] text-xs font-mono uppercase tracking-widest mb-1 font-bold">Réseau d'Agences</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Agences Nationales d'AFG <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Agences</span></h1>
          <p className="text-xs text-slate-500 mt-1">Gérez le registre physique d'implantation régionale et de cloisonnement documentaire d'AFG Bank Gabon.</p>
        </div>
        <button
          onClick={handleCreateNewClick}
          className="flex items-center gap-2 px-5 py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white text-xs font-bold rounded-full shadow-md shadow-[#0052CC]/10 transition-all cursor-pointer"
        >
          <Icons.PlusCircle className="w-4 h-4" />
          Ajouter une agence
        </button>
      </div>

      {/* Grid view of agencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency) => {
          const empCount = getEmployeeCountForAgency(agency.id);
          return (
            <div key={agency.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">CODE : {agency.code}</span>
                    <h4 className="text-sm font-bold text-slate-900 font-sans mt-0.5">{agency.name}</h4>
                  </div>
                  {agency.isHeadOffice ? (
                    <span className="px-2.5 py-1 bg-[#0052CC]/10 text-[#0052CC] border border-[#0052CC]/15 rounded-lg font-mono text-[9px] font-bold shrink-0">SIÈGE</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15 rounded-lg font-mono text-[9px] font-bold shrink-0">SUCCURSALE</span>
                  )}
                </div>

                <div className="space-y-1.5 text-slate-500 font-medium">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Icons.Navigation className="w-3.5 h-3.5 text-slate-400" />
                    <span>{agency.address}, {agency.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Icons.PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] truncate">
                    <Icons.MailOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono truncate select-all">{agency.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                <div className="text-slate-550 flex items-center gap-1">
                  <Icons.Users className="w-4 h-4 text-[#0052CC]" /> Staff : <strong className="text-slate-800 ml-0.5">{empCount} salariés</strong>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(agency)}
                    className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-lg cursor-pointer"
                    title="Modifier l'agence"
                  >
                    <Icons.Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingAgency(agency)}
                    disabled={agency.isHeadOffice}
                    className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg cursor-pointer disabled:opacity-40"
                    title="Supprimer l'agence"
                  >
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION SUPPRESSION DE SUCCURSALE */}
      {deletingAgency && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 animate-slide-up border border-slate-150 text-xs">
            <h3 className="text-sm font-black text-slate-900">Dissoudre l'agence régionale ?</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Voulez-vous supprimer définitivement la succursale <strong className="text-slate-805">{deletingAgency.name}</strong> ? Tout le cloisonnement de la base GED de ses employés de {deletingAgency.city} sera impacté.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAgency(null)}
                className="px-4 py-2 border border-slate-200 rounded-full cursor-pointer text-slate-500 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-650 hover:bg-red-600 text-white rounded-full font-bold cursor-pointer"
              >
                Confirmer la fermeture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT AGENCY DIALOG */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 animate-slide-up border border-slate-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-black text-slate-805 flex items-center gap-2">
                <Icons.PlusSquare className="w-5 h-5 text-[#0052CC]" /> 
                {editingAgency ? "Modification de Succursale" : "Enregistrement de Succursale"}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-805 cursor-pointer">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 font-semibold text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Code Agence *</label>
                  <input
                    required
                    type="text"
                    {...register("code")}
                    placeholder="Ex: AG-GAB05"
                    className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl uppercase focus:outline-none focus:bg-white focus:border-[#0052CC]"
                  />
                  {errors.code && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.code.message}</span>}
                </div>

                <div>
                  <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Ville *</label>
                  <input
                    required
                    type="text"
                    {...register("city")}
                    placeholder="Ex: Oyem"
                    className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                  />
                  {errors.city && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.city.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Nom Officiel Succursale *</label>
                <input
                  required
                  type="text"
                  {...register("name")}
                  placeholder="AFG BANK - Agence Oyem Nord"
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                />
                {errors.name && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Adresse d'Implantation *</label>
                <input
                  required
                  type="text"
                  {...register("address")}
                  placeholder="Avenue Président-Léon-Mba, Centre-ville"
                  className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                />
                {errors.address && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.address.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">Téléphone Ligne *</label>
                  <input
                    required
                    type="text"
                    {...register("phone")}
                    className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                  />
                  {errors.phone && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.phone.message}</span>}
                </div>

                <div>
                  <label className="block text-slate-405 font-mono tracking-widest uppercase mb-1.5 text-[9px]">E-mail Contact *</label>
                  <input
                    required
                    type="email"
                    {...register("email")}
                    className="w-full bg-slate-50 p-3 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#0052CC]"
                  />
                  {errors.email && <span className="text-red-500 font-mono text-[9px] mt-1 block">{errors.email.message}</span>}
                </div>
              </div>

              <div className="flex items-center gap-5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isHeadOffice")}
                    className="w-4.5 h-4.5 text-[#0052CC] rounded border-slate-350 focus:ring-0"
                  />
                  <span className="text-slate-700">Définir comme Siège Social National</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                  {isSubmitting ? "Traitement..." : editingAgency ? "Enregistrer" : "Créer l'agence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
