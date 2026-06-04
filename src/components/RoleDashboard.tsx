/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AgencyAdminDashboard from "./AgencyAdminDashboard";
import HRDashboard from "./HRDashboard";
import FinanceDashboard from "./FinanceDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ClientDashboard from "./ClientDashboard";

interface RoleDashboardProps {
  currentUser: any;
  employees: any[];
  documents: any[];
  agencies: any[];
}

export default function RoleDashboard({ currentUser, employees, documents, agencies }: RoleDashboardProps) {
  // Extract role
  const role = currentUser?.roleName || currentUser?.roleId || "CLIENT";

  switch (role) {
    case "SUPER_ADMIN":
      return (
        <SuperAdminDashboard
          currentUser={currentUser}
          employees={employees}
          documents={documents}
          agencies={agencies}
        />
      );

    case "ADMIN":
    case "AGENT_ADMIN":
      return (
        <AgencyAdminDashboard
          currentUser={currentUser}
          employees={employees}
          documents={documents}
        />
      );

    case "DRH":
    case "RH_MANAGER":
      return (
        <HRDashboard
          currentUser={currentUser}
          employees={employees}
        />
      );

    case "COMPTABLE":
      return (
        <FinanceDashboard
          currentUser={currentUser}
        />
      );

    case "EMPLOYEE":
      return (
        <EmployeeDashboard
          currentUser={currentUser}
        />
      );

    default:
      return (
        <ClientDashboard
          currentUser={currentUser}
        />
      );
  }
}
