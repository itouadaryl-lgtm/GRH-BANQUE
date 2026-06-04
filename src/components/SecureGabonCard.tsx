/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { User } from "../types";

interface SecureGabonCardProps {
  employee: User;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
}

export default function SecureGabonCard({
  employee,
  cardNumber,
  issueDate,
  expiryDate
}: SecureGabonCardProps) {
  
  // Clean names for MRZ representation
  const rawLastName = (employee.lastName || "NDONG").toUpperCase().replace(/[^A-Z]/g, "");
  const rawFirstName = (employee.firstName || "MARC").toUpperCase().replace(/[^A-Z]/g, "");
  const formattedMatricule = (employee.matricule || "AFG260025").toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  // Format dates for MRZ (YYMMDD format)
  // Clean birth date
  const cleanBirth = String(employee.birthDate || "1994-05-18").split("-");
  const birthYYMMDD = cleanBirth.length === 3 
    ? `${cleanBirth[0].substring(2)}${cleanBirth[1]}${cleanBirth[2]}` 
    : "940518";

  // Clean expiry date
  const cleanExpiry = String(expiryDate || "2028-05-28").split("-");
  const expiryYYMMDD = cleanExpiry.length === 3 
    ? `${cleanExpiry[0].substring(2)}${cleanExpiry[1]}${cleanExpiry[2]}` 
    : "280528";

  // Generate MRZ Lines according to Gabon civil norms
  // Line 1: Type & Issuer (IDGAB for Identity Gabon) followed by doc/card identifier
  const mrzLine1 = `IDGAB${formattedMatricule}8<<<<<<<<<<<<<<<`.substring(0, 30).padEnd(30, "<");
  // Line 2: Birth, Sex, Expiry, Nationality GAB
  const mrzLine2 = `${birthYYMMDD}1M${expiryYYMMDD}9GAB<<<<<<<<<<<7`.substring(0, 30).padEnd(30, "<");
  // Line 3: SURNAME << FIRSTNAME
  const mrzLine3 = `${rawLastName}<<${rawFirstName}`.padEnd(30, "<").substring(0, 30);

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto font-sans select-none" id="gab-card-preview-root">
      
      {/* ----------------- RECTO (FRONT) ----------------- */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] animate-pulse"></span>
            RECTO (FACE AVANT)
          </span>
          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            Polycarbonate Sécurisé
          </span>
        </div>

        <div id="gab-card-front" className="relative aspect-[1.58/1] w-full bg-slate-105 border border-slate-200 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] group">
          
          {/* Outer high-security subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-amber-500/5 to-blue-500/5 pointer-events-none" />

          {/* Concentric Guilloche pattern lines using SVG overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-105">
              <defs>
                <pattern id="guilloche-recto" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(25 0 0)">
                  <path d="M 0,10 C 10,10 10,0 20,0 C 30,0 30,10 40,10 C 30,10 30,20 20,20 C 10,20 10,10 0,10 Z" fill="none" stroke="#2563eb" strokeWidth="0.5" />
                  <path d="M 0,30 C 10,30 10,20 20,20 C 30,20 30,30 40,30 C 30,30 30,40 20,40 C 10,40 10,30 0,30 Z" fill="none" stroke="#eab308" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#guilloche-recto)" />
              {/* Concentric rings in the center of the card resembling security layers */}
              <circle cx="50%" cy="50%" r="90" fill="none" stroke="#10b981" strokeWidth="0.4" strokeDasharray="3,3" />
              <circle cx="50%" cy="50%" r="130" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
              <circle cx="50%" cy="50%" r="170" fill="none" stroke="#eab308" strokeWidth="0.3" />
            </svg>
          </div>

          {/* Detailed Watermark background of GABON'S COAT OF ARMS (Symbol of the Republic) */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
            <svg className="w-64 h-64 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              {/* Custom SVG silhouette representing the Libreville central seal & coat of arms */}
              <path d="M50 5 L85 20 L85 55 C85 75 50 95 50 95 C50 95 15 75 15 55 L15 20 Z" />
              <path d="M30 40 H70 M30 50 H70 M40 60 H60" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="35" r="10" />
            </svg>
          </div>

          {/* Secure microprint diagonal watermarks (resembling Congolese/Gabon national text) */}
          <div className="absolute -left-12 top-10 rotate-12 opacity-5 pointer-events-none font-mono text-[5px] tracking-tight text-slate-800 leading-none select-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <p key={i}>RÉPUBLIQUE GABONAISE*AFG BANK GABON*SÉCURITÉ ET CONFORMITÉ COBAC*ISO-27001*</p>
            ))}
          </div>

          {/* 1. Header with GABON flag bands (Green, Yellow, Blue inline ribbons) and Republic labels */}
          <div className="p-4.5 pb-2.5 border-b border-slate-200/50 flex justify-between items-start relative z-10 bg-white/40 backdrop-blur-[2px]">
            <div className="flex gap-3 items-center">
              {/* Gabon National Flag Ribbon */}
              <div className="flex flex-col w-6 h-5.5 rounded overflow-hidden shadow-sm shrink-0 border border-slate-200">
                <div className="bg-[#00cd52] h-1/3" /> {/* Green */}
                <div className="bg-[#fcd116] h-1/3" /> {/* Yellow */}
                <div className="bg-[#3a75c4] h-1/3" /> {/* Blue */}
              </div>
              
              <div className="leading-none">
                <h3 className="text-[10px] font-black tracking-widest text-slate-900 uppercase">RÉPUBLIQUE GABONAISE</h3>
                <p className="text-[6.5px] uppercase text-[#0052CC] font-bold tracking-wider mt-0.5">Union · Travail · Justice</p>
                <span className="text-[6px] text-slate-400 font-mono tracking-wider font-extrabold">CNI-Style Bank ID Standard</span>
              </div>
            </div>

            <div className="text-right leading-none">
              <span className="text-[10.5px] font-black text-[#0052CC] block tracking-tight">AFG BANK GABON</span>
              <span className="text-[5.5px] uppercase font-mono tracking-widest text-[#00cd52] font-bold mt-1 block">Accréditation Nationale</span>
            </div>
          </div>

          {/* 2. Middle section: Photo 4x4, Gold Chip & personal variables */}
          <div className="p-4.5 pt-3.5 flex items-start gap-4.5 relative z-10">
            
            {/* Securitized Photo Container with microprint lines and holograms */}
            <div className="relative shrink-0">
              <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-slate-300 relative bg-slate-100 shadow-md">
                <img
                  src={employee.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
                
                {/* Guilloche diagonal holographic lines on top of the image to prevent spoofing */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(60deg,transparent,transparent_4px,rgba(255,255,255,0.2)_4px,rgba(255,255,255,0.2)_5px)] pointer-events-none" />
                
                {/* Micro logo watermarked in the corner of the photo */}
                <div className="absolute bottom-1 right-1 opacity-60 bg-white/85 rounded-full p-0.5 pointer-events-none border border-slate-100">
                  <Icons.ShieldCheck className="w-2.5 h-2.5 text-[#0052CC]" />
                </div>
              </div>

              {/* Secure barcode numbering at the edge of the photo */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded border border-slate-200 shadow text-[6px] font-mono font-bold text-slate-800 tracking-wide">
                {employee.matricule}
              </div>
            </div>

            {/* Smart Contact Card Chip & Dynamic Data */}
            <div className="flex-1 space-y-1.5 h-24 flex flex-col justify-between font-semibold">
              
              {/* Gold Security Chip mimicking real polycarbonate smart ID cards */}
              <div className="flex justify-between items-start">
                <div className="w-7 h-5.5 rounded bg-gradient-to-tr from-[#ffd60a] via-[#eab308] to-[#9a3412] p-0.5 border border-amber-600 shadow-inner shrink-0 relative flex flex-col justify-between overflow-hidden">
                  <div className="grid grid-cols-3 gap-[1px] h-full w-full opacity-60">
                    <div className="border-r border-b border-amber-805" />
                    <div className="border-r border-b border-amber-805" />
                    <div className="border-b border-amber-805" />
                    <div className="border-r border-amber-805" />
                    <div className="border-r border-amber-805" />
                    <div />
                  </div>
                  {/* Chip laser mark */}
                  <div className="absolute inset-1.5 border border-amber-900/30 rounded-sm" />
                </div>
                
                <div className="text-right leading-none">
                  <span className="text-[6.5px] uppercase tracking-widest text-[#0052CC] font-mono block">CARTE PROFESSIONNELLE</span>
                  <span className="text-[8.5px] text-slate-800 font-extrabold block mt-0.5 uppercase tracking-wide">
                    {employee.department.substring(0, 24)}
                  </span>
                </div>
              </div>

              {/* Identity labels exactly stylized representing Gabonese/Congo official standards */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-800 leading-tight">
                <div>
                  <span className="text-[5.5px] text-slate-400 font-mono block uppercase">NOM / LAST NAME</span>
                  <p className="text-[10px] font-black tracking-wide truncate uppercase text-[#0052CC]">
                    {employee.lastName || "NDONG"}
                  </p>
                </div>
                <div>
                  <span className="text-[5.5px] text-slate-400 font-mono block uppercase">PRÉNOMS / FIRST NAMES</span>
                  <p className="text-[10px] font-black tracking-wide truncate uppercase text-slate-900">
                    {employee.firstName || "MARC"}
                  </p>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-1 mt-0.5">
                  <div>
                    <span className="text-[5.5px] text-slate-400 font-mono block uppercase">NÉ(E) LE / BORN</span>
                    <p className="text-[7.5px] font-bold text-slate-800">
                      {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString("fr-FR") : "12/04/1993"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[5.5px] text-slate-400 font-mono block uppercase">SEXE / SEX</span>
                    <p className="text-[7.5px] font-bold text-slate-800">M</p>
                  </div>
                  <div>
                    <span className="text-[5.5px] text-slate-400 font-mono block uppercase">POSTE / STATUS</span>
                    <p className="text-[7.5px] font-bold text-[#0052CC] truncate">
                      {employee.position}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 3. Bottom holographic stripe and state seal */}
          <div className="absolute bottom-2.5 right-4.5 left-4.5 flex justify-between items-end bg-transparent pt-1 border-t border-slate-200/50">
            <span className="text-[6.5px] text-slate-450 font-mono uppercase tracking-widest">
              N° DE CARTE: <strong className="text-slate-800">{cardNumber}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[6px] text-slate-400 font-mono uppercase">EMPREINTE DIGITALE</span>
              <Icons.Pocket className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

          {/* Gold holographic circle badge that turns on hover */}
          <div className="absolute right-4 bottom-7 w-7 h-7 rounded-full bg-gradient-to-tr from-[#ffd60a] to-[#bfdbfe] border border-white/60 shadow flex items-center justify-center pointer-events-none group-hover:rotate-45 transition-transform duration-500 opacity-80">
            <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

        </div>
      </div>

      {/* ----------------- VERSO (BACK) ----------------- */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            VERSO (FACE ARRIÈRE)
          </span>
          <span className="text-[9px] font-mono text-slate-450 uppercase font-bold">
            Zone de Lecture Automatique (MRZ)
          </span>
        </div>

        <div id="gab-card-back" className="relative aspect-[1.58/1] w-full bg-slate-900 text-white border border-slate-950 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] group">
          
          {/* Subtle security mesh on back */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <pattern id="guilloche-verso" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
                  <path d="M 0,0 L 20,20 M 20,0 L 0,20" fill="none" stroke="#ffffff" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#guilloche-verso)" />
            </svg>
          </div>

          <div className="p-4.5 h-full flex flex-col justify-between relative z-10">
            
            {/* Top Back Details: Filiation, authorities & Barcode */}
            <div className="grid grid-cols-12 gap-3.5">
              
              {/* Back fields */}
              <div className="col-span-8 space-y-1.5 text-left">
                <div className="border-b border-white/10 pb-1">
                  <h4 className="text-[7.5px] uppercase font-mono text-[#00cd52] tracking-wider font-bold">Cabinet de Conformité & Sécurité</h4>
                  <p className="text-[6px] text-slate-400 font-sans leading-relaxed">Cette carte est strictement nominative et reste la propriété d'AFG Bank Gabon.</p>
                </div>

                <div className="space-y-1 text-[8px] text-slate-300">
                  <p className="font-semibold"><span className="text-slate-450 font-mono text-[7px] uppercase block">DÉLIVRÉ LE / DATE OF ISSUE</span> {issueDate || "2026-05-28"}</p>
                  <p className="font-semibold"><span className="text-slate-450 font-mono text-[7px] uppercase block">EXPIRE LE / DATE OF EXPIRY</span> {expiryDate || "2028-05-28"}</p>
                  <p className="font-semibold mt-1 truncate"><span className="text-slate-450 font-mono text-[7px] uppercase block">REPRÉSENTANT LOCAL / SIGNATORY</span> Cabinet de Sécurité / Direction de l'Habilitation</p>
                </div>
              </div>

              {/* Fingerprint + QR Code Vector precisely sized to match identity standards */}
              <div className="col-span-4 flex flex-col items-center justify-between h-[105px] border-l border-white/10 pl-3">
                <div className="flex flex-col items-center">
                  <span className="text-[5.5px] text-slate-400 font-mono uppercase mb-0.5 font-bold">Index Droit</span>
                  {/* Fingerprint icon pattern SVG */}
                  <div className="w-8 h-10 bg-white/5 rounded p-1 flex items-center justify-center border border-white/10">
                    <svg className="w-full h-full text-[#ffd60a] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2a10 10 0 0 0-10 10M12 5a7 7 0 0 1 7 7M8 12a4 4 0 0 1 8 0 M12 15v3 M10 18h4 M12 8a4 4 0 0 0-4 4" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* QR Code vector */}
                <div className="bg-white p-1 rounded-lg shrink-0 shadow shadow-black self-center mt-1">
                  <svg className="w-8 h-8" viewBox="0 0 29 29" shapeRendering="crispEdges">
                    <path fill="#ffffff" d="M0 0h29v29H0z"/>
                    <path fill="#111827" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm9 0h2v2H9zm2 2h2v2h-2zm-2 2h2v2H9zm6-4h4v2h-4zm2 2h4v2h-4zm2-18h2v4h-2zm-12 2h2v2H9zm2 2h2v2H9z"/>
                  </svg>
                </div>
              </div>

            </div>

            {/* High Definition Premium Barcode exactly on verso (like in Congolese ID backside bottom side or top side) */}
            <div className="flex flex-col space-y-0.5 mt-1 border-t border-white/10 pt-1.5 pb-1">
              <span className="text-[5.5px] text-slate-450 font-mono tracking-widest text-center uppercase block">Securitized Barcode (Code-128 Compliant)</span>
              
              {/* Complex high-end vector barcode */}
              <div className="h-6 w-full bg-white rounded p-1 flex items-stretch justify-between relative overflow-hidden">
                {Array.from({ length: 95 }).map((_, i) => {
                  // Determinate mock bar widths programmatically for realism
                  const isGap = (i * 3 + 7) % 5 === 0;
                  const widthClass = i % 7 === 0 ? "w-[3px]" : i % 3 === 0 ? "w-[2px]" : "w-[1px]";
                  return (
                    <div
                      key={i}
                      className={`h-full bg-slate-900 shrink-0 ${widthClass}`}
                      style={{ opacity: isGap ? 0 : 1 }}
                    />
                  );
                })}
              </div>
              <span className="text-[6.5px] text-center font-mono text-slate-350">{`*${formattedMatricule}*`}</span>
            </div>

            {/* MRZ - Machine Readable Zone directly printed onto the bottom in high realism */}
            <div className="bg-emerald-500/5 border border-white/5 rounded-xl p-2 font-mono text-[8.5px] leading-none tracking-[2.5px] text-amber-200/90 font-bold select-all flex flex-col space-y-0.5">
              <span>{mrzLine1}</span>
              <span>{mrzLine2}</span>
              <span>{mrzLine3}</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
