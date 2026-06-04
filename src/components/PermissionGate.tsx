/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { permissionsService } from "../services/permissions.service";

interface PermissionGateProps {
  permission: string;
  currentUser: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGate({ permission, currentUser, children, fallback = null }: PermissionGateProps) {
  const isSuperAdmin = currentUser?.roleName === "SUPER_ADMIN" || currentUser?.roleId === "SUPER_ADMIN";
  const hasPerm = isSuperAdmin || (currentUser?.permissions && (
    currentUser.permissions.includes("*") || currentUser.permissions.includes(permission)
  )) || permissionsService.hasPermission(currentUser?.roleId || currentUser?.roleName, currentUser?.permissions || [], permission);

  if (hasPerm) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
