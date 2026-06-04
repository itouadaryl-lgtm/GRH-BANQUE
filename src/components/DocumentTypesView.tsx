/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
}

interface DocumentType {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  isActive: boolean;
  iconColor?: string;
  iconType?: string;
}

interface DocumentTypesViewProps {
  currentUser: any;
  categories: Category[];
  onRefreshAll: () => void;
}

export default function DocumentTypesView({ currentUser, categories, onRefreshAll }: DocumentTypesViewProps) {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("cat-contrats");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit states
  const [editingType, setEditingType] = useState<DocumentType | null>(null);

  const fetchDocTypes = async () => {
    try {
      const headers: any = {
        "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
      };
      const response = await fetch("/api/document-types", { headers });
      const json = await response.json();
      if (json.success) {
        setDocTypes(json.data);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocTypes();
  }, [currentUser?.id]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Le nom est obligatoire");
      return;
    }

    try {
      const response = await fetch("/api/document-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
        },
        body: JSON.stringify({ name, categoryId, description })
      });
      const json = await response.json();
      if (json.success) {
        setSuccessMsg("Type de document créé avec succès !");
        setName("");
        setDescription("");
        setErrorMsg("");
        setShowAddForm(false);
        fetchDocTypes();
        onRefreshAll();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(json.message || "Erreur de création");
      }
    } catch {
      setErrorMsg("Erreur de connexion au serveur d'archives");
    }
  };

  const handleToggleActive = async (type: DocumentType) => {
    try {
      const response = await fetch(`/api/document-types/${type.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
        },
        body: JSON.stringify({ isActive: !type.isActive })
      });
      const json = await response.json();
      if (json.success) {
        fetchDocTypes();
        onRefreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    try {
      const response = await fetch(`/api/document-types/${editingType.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
        },
        body: JSON.stringify({
          name: editingType.name,
          categoryId: editingType.categoryId,
          description: editingType.description,
          isActive: editingType.isActive
        })
      });
      const json = await response.json();
      if (json.success) {
        setSuccessMsg("Type de document mis à jour avec succès !");
        setEditingType(null);
        fetchDocTypes();
        onRefreshAll();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch {
      setErrorMsg("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la suppression du type "${name}" ?`)) return;

    try {
      const response = await fetch(`/api/document-types/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser?.id || "u-aime"}`
        }
      });
      const json = await response.json();
      if (json.success) {
        setSuccessMsg("Type supprimé avec succès.");
        fetchDocTypes();
        onRefreshAll();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch {
      setErrorMsg("Impossible de supprimer cette typologie");
    }
  };

  const filteredDocTypes = docTypes.filter((dt) => {
    const categoryObj = categories.find(c => c.id === dt.categoryId);
    const catName = categoryObj ? categoryObj.name : "";
    return (
      dt.name.toLowerCase().includes(search.toLowerCase()) ||
      catName.toLowerCase().includes(search.toLowerCase()) ||
      (dt.description || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-slide-up pb-12 text-xs font-semibold">
      
      {/* Banner design */}
      <div className="pb-4 border-b border-slate-150 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[#0052CC] text-[10px] font-mono uppercase tracking-widest mb-1 font-bold">Gouvernance GED et Structuration</p>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Types de Documents GED <span className="text-slate-300">/</span> <span className="italic font-serif text-[#0052CC] font-bold">Typologies</span></h1>
          <p className="text-xs text-slate-500 mt-1">Gérez le dictionnaire des classifications de fichiers d'accréditation et contrats d'AFG Bank Gabon.</p>
        </div>
        <button
          onClick={() => {
            setEditingType(null);
            setShowAddForm(!showAddForm);
          }}
          className="px-5 py-3.5 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-2xl flex items-center justify-center gap-2 font-display font-bold shadow-[0_4px_12px_rgba(0,82,204,0.15)] transition-all cursor-pointer select-none ring-offset-2 hover:scale-[1.01]"
        >
          <Icons.Plus className="w-4 h-4" />
          Nouveau Type de Document
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-800 flex items-center gap-3">
          <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-800 flex items-center gap-3">
          <Icons.XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Grid view containing search and display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search bar card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center gap-3">
            <Icons.Search className="w-4 h-4 text-slate-405 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par libellé ou catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-slate-700 outline-none w-full font-normal"
            />
          </div>

          {loading ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
              <Icons.Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0052CC]" />
              <p>Chargement des métadonnées typologiques de la banque...</p>
            </div>
          ) : filteredDocTypes.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
              <Icons.SearchX className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>Aucun type de document ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocTypes.map((type) => {
                const category = categories.find(c => c.id === type.categoryId);
                return (
                  <div
                    key={type.id}
                    className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-[#0052CC] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100`}>
                            <Icons.FileText className="w-5 h-5 text-[#0052CC]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{type.name}</h4>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold uppercase font-mono tracking-wider">
                              {category ? category.name : "Non classifié"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleActive(type)}
                          title={type.isActive ? "Désactiver" : "Activer"}
                          className={`p-1.5 rounded-xl border transition-all ${
                            type.isActive 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/30" 
                              : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100/30"
                          }`}
                        >
                          {type.isActive ? (
                            <Icons.CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <Icons.XCircle className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      </div>

                      <p className="text-slate-500 font-normal mt-3 leading-relaxed">
                        {type.description || "Aucune description fournie pour cette typologie d'archive."}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">IDF: {type.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingType(type);
                            setShowAddForm(false);
                            // Scroll if needed
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all"
                          title="Modifier"
                        >
                          <Icons.Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type.id, type.name)}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-650 rounded-xl transition-all"
                          title="Supprimer définitivement"
                        >
                          <Icons.Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Form Column */}
        <div className="space-y-4">
          
          {/* Add form panel */}
          {showAddForm && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md animate-slide-up space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Icons.FilePlus2 className="w-4 h-4 text-[#0052CC]" />
                  Nouvelle Classification
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">Nom de la Typologie *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Certificat de scolarité"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none text-slate-700 font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">Catégorie d'affiliation *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#0052CC] outline-none text-slate-750 font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">Description et Consignes d'Audit</label>
                  <textarea
                    placeholder="Quelles sont les directives réglementaires liées à cette pièce d'archive ?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none text-slate-700 font-normal leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-xl font-bold font-sans transition-all flex items-center justify-center gap-2"
                >
                  <Icons.Check className="w-4 h-4" />
                  Enregistrer la Classification
                </button>
              </form>
            </div>
          )}

          {/* Edit form panel */}
          {editingType && (
            <div className="bg-white border-2 border-dashed border-blue-200 rounded-3xl p-6 shadow-md animate-slide-up space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Icons.Edit className="w-4 h-4 text-blue-600" />
                  Modifier la Typologie
                </h3>
                <button
                  onClick={() => setEditingType(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">Nom de la Typologie *</label>
                  <input
                    type="text"
                    required
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#0052CC] outline-none text-slate-700 font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">Catégorie d'affiliation *</label>
                  <select
                    value={editingType.categoryId}
                    onChange={(e) => setEditingType({ ...editingType, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#0052CC] outline-none text-slate-750 font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">Description et Consignes d'Audit</label>
                  <textarea
                    value={editingType.description}
                    onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none text-slate-700 font-normal leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold font-sans transition-all flex items-center justify-center gap-2"
                  >
                    <Icons.Check className="w-4 h-4" />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingType(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Informative Guide Widget */}
          <div className="bg-gradient-to-tr from-[#0052CC]/5 to-[#0A84FF]/5 border border-slate-100 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider font-mono text-[10px]">
              <Icons.ShieldCheck className="w-4 h-4 text-[#0052CC]" />
              Règles d'Audit COBAC
            </h4>
            <p className="text-slate-500 font-normal leading-relaxed">
              Toute modification apportée au dictionnaire des classifications est instantanément journalisée de manière indélébile dans le **Journal d'Activités d'AFG BANK**, avec captures d'empreintes numériques et métadonnées d'habilitation du signataire.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
