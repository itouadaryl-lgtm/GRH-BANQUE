/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { permissionsService } from "./permissions.service";

interface PermissionGuardProps {
  permission: string;
  currentUser: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ permission, currentUser, children, fallback }: PermissionGuardProps) {
  const isSuperAdmin = currentUser?.roleName === "SUPER_ADMIN" || currentUser?.roleId === "SUPER_ADMIN";
  const hasPerm = isSuperAdmin || (currentUser?.permissions && (
    currentUser.permissions.includes("*") || currentUser.permissions.includes(permission)
  )) || permissionsService.hasPermission(currentUser?.roleId || currentUser?.roleName, currentUser?.permissions || [], permission);

  if (hasPerm) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 max-w-xl mx-auto my-12 animate-slide-up">
      <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center shadow-md">
        <Icons.KeyRound className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">
          ZONE CONTRÔLÉE : {permission}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2">Privilèges Insuffisants</h2>
        <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto font-medium">
          Votre compte (<strong>{currentUser?.fullName || "Utilisateur Anonyme"}</strong>) n'a pas les droits nécessaires (<strong>{permission}</strong>) sur ce module.
        </p>
      </div>
      <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 w-full text-left font-mono text-[10px] text-slate-400 space-y-1">
        <p>REQUISITE_CLAIM: {permission}</p>
        <p>DIAGNOSTIC_STAMP: ACTION_BLOCKED</p>
      </div>
    </div>
  );
}
