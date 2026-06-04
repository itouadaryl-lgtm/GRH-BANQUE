/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleName } from "../types";

export interface PermissionDetails {
  code: string;
  label: string;
  module: "DOCUMENTS" | "EMPLOYEES" | "FINANCES" | "SYSTEM" | "WORKFLOW";
}

export const PERMISSIONS_REGISTRY: Record<string, PermissionDetails> = {
  // Documents Module
  "DOCUMENT_CREATE": { code: "DOCUMENT_CREATE", label: "Verser des documents", module: "DOCUMENTS" },
  "DOCUMENT_READ": { code: "DOCUMENT_READ", label: "Consulter la GED nationale", module: "DOCUMENTS" },
  "DOCUMENT_DELETE": { code: "DOCUMENT_DELETE", label: "Envoyer à la corbeille", module: "DOCUMENTS" },
  "DOCUMENT_PURGE": { code: "DOCUMENT_PURGE", label: "Purger définitivement", module: "DOCUMENTS" },

  // Employees Module
  "EMPLOYEE_CREATE": { code: "EMPLOYEE_CREATE", label: "Recruter un collaborateur", module: "EMPLOYEES" },
  "EMPLOYEE_READ": { code: "EMPLOYEE_READ", label: "Consulter le registre RH", module: "EMPLOYEES" },
  "EMPLOYEE_UPDATE": { code: "EMPLOYEE_UPDATE", label: "Modifier les dossiers RH", module: "EMPLOYEES" },
  "CARD_GENERATE": { code: "CARD_GENERATE", label: "Générer des cartes professionnelles", module: "EMPLOYEES" },

  // Finance Module
  "FINANCE_VIEW": { code: "FINANCE_VIEW", label: "Consulter les budgets et salaires", module: "FINANCES" },
  "FINANCE_MANAGE": { code: "FINANCE_MANAGE", label: "Ordonnancer les virements", module: "FINANCES" },

  // System Administration
  "AGENCY_VIEW": { code: "AGENCY_VIEW", label: "Consulter le réseau d'agences", module: "SYSTEM" },
  "AGENCY_MANAGE": { code: "AGENCY_MANAGE", label: "Gérer l'infrastructure d'agences", module: "SYSTEM" },
  "USER_READ": { code: "USER_READ", label: "Consulter les comptes utilisateurs", module: "SYSTEM" },
  "ROLE_ASSIGN": { code: "ROLE_ASSIGN", label: "Configurer les droits et permissions", module: "SYSTEM" },
  "CHATBOT_ACCESS": { code: "CHATBOT_ACCESS", label: "Discuter avec l'assistant ARHI IA", module: "SYSTEM" },
  
  // Workflows
  "WORKFLOW_APPROVE": { code: "WORKFLOW_APPROVE", label: "Valider les demandes de décloisonnement", module: "WORKFLOW" },
  "WORKFLOW_CREATE": { code: "WORKFLOW_CREATE", label: "Créer des demandes de décloisonnement", module: "WORKFLOW" },
};

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleName | string, string[]> = {
  SUPER_ADMIN: ["*"], // Wildcard permissions
  
  ADMIN: [
    "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_DELETE",
    "EMPLOYEE_READ", "EMPLOYEE_UPDATE",
    "CARD_GENERATE", "AGENCY_VIEW", "CHATBOT_ACCESS", "WORKFLOW_CREATE"
  ],
  
  DRH: [
    "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_DELETE",
    "EMPLOYEE_READ", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE",
    "CARD_GENERATE", "AGENCY_VIEW", "ROLE_ASSIGN", "CHATBOT_ACCESS", "WORKFLOW_APPROVE", "WORKFLOW_CREATE"
  ],
  
  RH_MANAGER: [
    "DOCUMENT_READ", "DOCUMENT_CREATE",
    "EMPLOYEE_READ", "EMPLOYEE_UPDATE",
    "CARD_GENERATE", "AGENCY_VIEW", "CHATBOT_ACCESS"
  ],
  
  COMPTABLE: [
    "DOCUMENT_READ",
    "FINANCE_VIEW", "FINANCE_MANAGE",
    "CHATBOT_ACCESS"
  ],
  
  EMPLOYEE: [
    "DOCUMENT_READ",
    "CHATBOT_ACCESS"
  ],
  
  AUDITOR: [
    "DOCUMENT_READ",
    "EMPLOYEE_READ",
    "AGENCY_VIEW"
  ],

  RETIRED: [],
  AGENT_ADMIN: ["CHATBOT_ACCESS", "DOCUMENT_READ"]
};

export const permissionsService = {
  /**
   * Evaluates if a given role possesses a particular permission
   */
  hasPermission(userRoleName: string, userPermissions: string[], permissionRequired: string): boolean {
    if (!userRoleName) return false;
    
    // Super Administrators bypass all permission blocks
    if (userRoleName === "SUPER_ADMIN" || userPermissions?.includes("*")) {
      return true;
    }

    if (userPermissions && userPermissions.includes(permissionRequired)) {
      return true;
    }

    // Dynamic list check from roles maps
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[userRoleName] || [];
    return defaultPerms.includes(permissionRequired);
  },

  /**
   * Scopes documents or logs visibility based on user agency bindings for local Admins
   */
  filterByAgencyScope<T extends { agencyId?: string }>(
    items: T[],
    userRoleName: string,
    userAgencyId: string,
    supervisionActive: boolean = false
  ): T[] {
    if (!userRoleName || userRoleName === "SUPER_ADMIN" || userRoleName === "DRH") {
      // Super Admins see everything, unless they voluntarily toggle localized ag-siege viewing
      if (supervisionActive) {
        return items;
      }
    }
    
    // Local agency admins can only see their own agency items
    if (userRoleName === "ADMIN" || userRoleName === "RH_MANAGER") {
      return items.filter(item => item.agencyId === userAgencyId);
    }

    // Default: local filtering
    return items.filter(item => item.agencyId === userAgencyId);
  }
};
