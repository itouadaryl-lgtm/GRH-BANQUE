/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { toast } from "sonner";

interface ClientProps {
  currentUser: any;
}

interface Appointment {
  id: string;
  advisor: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status: "CONFIRMED";
}

export default function ClientDashboard({ currentUser }: ClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "apt-1", advisor: "Marie Claire (DRH)", date: "2026-06-05", time: "10:30", type: "Onboarding & Accréditation", notes: "Récupération physique des cartes authentifiées", status: "CONFIRMED" }
  ]);

  const [advisor, setAdvisor] = useState("Pierre Moubamba (Comptabilité)");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Vérification Dossiers & Solde");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmitApt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Veuillez sélectionner la date et l'heure du rendez-vous");
      return;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      advisor,
      date,
      time,
      type,
      notes: notes || "Sans commentaire additionnel",
      status: "CONFIRMED"
    };

    setAppointments([...appointments, newApt]);
    toast.success("Votre rendez-vous a été enregistré et confirmé par la succursale d'AFG Bank !");
    setShowForm(false);
    setDate("");
    setTime("");
    setNotes("");
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Banner Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-650 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-white/20 text-indigo-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Espace Client Central
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 animate-pulse-slow">
            Espace Client — AFG Bank Gabon
          </h1>
          <p className="text-white/85 text-xs mt-1 leading-relaxed">
            Consultez le statut de vos demandes d'accréditation, inspectez vos dossiers de financement validés et planifiez vos entrevues avec nos conseillers clientèle.
          </p>
        </div>
      </div>

      {/* Main body info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Requests & Schedule History */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-855">Suivi de Vos Demandes d'Hébergement</h3>
            <p className="text-slate-400 text-[10px]">Statut des requêtes soumises au secrétariat général de Libreville.</p>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all text-xs">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Icons.FileCheck className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-805 leading-none">Attestation de Virement</h4>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-1">Demande d'audit #2026-0034</p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 font-bold px-2 rounded-lg">
                Prêt / Validé
              </span>
            </div>

            <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
              Votre dossier de garanties bancaires a été signé et scellé numériquement sous protocole SHA-256. Vous pouvez le télécharger via la GED latérale à tout instant.
            </p>
          </div>

          {/* List of Scheduled Appointments */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-855 text-xs">Vos Rendez-vous à la Succursale</h3>
            
            {appointments.length === 0 ? (
              <p className="text-slate-400 text-[10px]">Aucun rendez-vous planifié.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt.id} className="p-3 bg-slate-50 rounded-2xl border flex flex-col gap-1 hover:border-indigo-150 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-805">{apt.type}</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full font-mono">
                        CONFIRMÉ
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10.5px]">Conseiller : {apt.advisor}</p>
                    <p className="text-indigo-600 font-semibold text-[10.5px]">Le {apt.date} à {apt.time}</p>
                    <p className="text-slate-500 text-[10px] italic">"{apt.notes}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Appointment booking */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4 text-xs font-sans">
            <h3 className="font-bold text-slate-805 text-xs flex items-center gap-2">
              <Icons.CalendarClock className="w-5 h-5 text-indigo-600" />
              <span>Prendre un Rendez-vous Privé</span>
            </h3>
            <p className="text-slate-400 text-[10.5px]">Sélectionnez un créneau physique avec nos experts pour évaluer vos cautions bancaires.</p>

            {showForm ? (
              <form onSubmit={handleSubmitApt} className="space-y-3 animate-scale-in">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Expert Conseil</label>
                  <select
                    value={advisor}
                    onChange={(e) => setAdvisor(e.target.value)}
                    className="w-full p-2 border border-slate-100 rounded-xl bg-white"
                  >
                    <option value="Marie Claire (Gestionnaire DRH)">Marie Claire (Onboarding GED & Cartes d'Accès)</option>
                    <option value="Pierre Moubamba (Comptabilité)">Pierre Moubamba (Virement & Cautions)</option>
                    <option value="Jean Mouala (Directeur de Paie)">Jean Mouala (Prêts & Finances)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-1.5 border border-slate-100 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Heure</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-1.5 border border-slate-100 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Motif du Rendez-vous</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 border border-slate-100 rounded-xl bg-white"
                  >
                    <option value="Dépôt Cautionnement Coffre">Dépôt Cautionnement Coffre-fort Physique</option>
                    <option value="Vérification Dossiers & Solde">Vérification Dossiers & Solde Réglementaire</option>
                    <option value="Ouverture Ligne Crédit">Ouverture de Ligne de Crédit de Financement</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Commentaires (Optionnel)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Précisez votre demande..."
                    className="w-full p-2 border border-slate-100 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow cursor-pointer text-center"
                  >
                    Confirmer Réunion
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl cursor-pointer"
                  >
                    Retour
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 text-slate-705 border border-transparent hover:border-indigo-200 rounded-2xl text-[10.5px] font-bold transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Icons.Calendar className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Choisir un créneau d'entrevue</span>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-[10.5px] text-indigo-805 font-bold leading-normal leading-relaxed">
            Pour vos transactions de guichet physique ou dépôts de chèques, veuillez vous présenter muni de votre carte d'identité ou badge crypté à l'accueil de la succursale d'AFG Gabon.
          </div>
        </div>

      </div>
    </div>
  );
}
