/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { RoleName } from "../types";

interface RoleGuardProps {
  allowedRoles: RoleName[];
  currentUser: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, currentUser, children, fallback }: RoleGuardProps) {
  const hasRole = currentUser && allowedRoles.includes(currentUser.roleName || currentUser.roleId);

  if (hasRole) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 max-w-xl mx-auto my-12 animate-slide-up">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-lg border border-rose-200">
        <Icons.ShieldAlert className="w-8 h-8 font-bold" />
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase">
          RÔLES REQUIS : {allowedRoles.join(" | ")}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2">Accès Restreint par Rôle</h2>
        <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto font-medium">
          Désolé, votre rôle d'accès actuel (<strong>{currentUser?.roleName || "Visiteur Libre"}</strong>) n'est pas habilité à visualiser ce module.
        </p>
      </div>
      <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 w-full text-left font-mono text-[10px] text-slate-400 space-y-1">
        <p>REQUIRED_ROLES: {allowedRoles.join(", ")}</p>
        <p>USER_IDENTITY: {currentUser?.fullName || "Non connecté"}</p>
        <p>IP_COMPLIANCE_SIGNATURE: VALIDE</p>
      </div>
    </div>
  );
}
