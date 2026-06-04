import React from "react";
import * as Icons from "lucide-react";

interface SecurityGateProps {
  permission: string;
  currentUser: { fullName?: string; roleName?: string; permissions?: string[]; agencyId?: string } | null;
  children: React.ReactNode;
}

export default function SecurityGate({ permission, currentUser, children }: SecurityGateProps) {
  const isSuperAdmin = currentUser?.roleName === "SUPER_ADMIN";
  const hasPerm =
    isSuperAdmin ||
    (currentUser?.permissions &&
      (currentUser.permissions.includes("*") || currentUser.permissions.includes(permission)));

  if (hasPerm) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 max-w-xl mx-auto my-12 animate-slide-up">
      <div className="w-16 h-16 bg-[#0052CC]/10 text-[#0052CC] rounded-full flex items-center justify-center shadow-lg">
        <Icons.Lock className="w-8 h-8 font-bold" />
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#0052CC] bg-[#0052CC]/10 px-3 py-1 rounded-full uppercase">
          ZONE CONTRÔLÉE : {permission}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2">Habilitations Insuffisantes</h2>
        <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto font-medium">
          Votre compte (<strong>{currentUser?.fullName || "Utilisateur"}</strong>) attribué au rôle{" "}
          <span className="font-mono text-slate-850 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
            {currentUser?.roleName || "Néant"}
          </span>{" "}
          ne possède pas le privilège requis pour ce module.
        </p>
      </div>
      <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 w-full text-left font-mono text-[10px] text-slate-400 space-y-1">
        <p>REQUISITE_CLAIM: {permission}</p>
        <p>DELEGATED_AGENCY: {currentUser?.agencyId || "AG-LOCALE"}</p>
        <p>DIGITAL_DIGNITY_LEVEL: SÉCURISÉ</p>
      </div>
    </div>
  );
}
