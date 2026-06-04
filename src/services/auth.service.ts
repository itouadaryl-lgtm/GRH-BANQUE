/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jwtService, TokenPayload } from "./jwt.service";
import { ROLE_DEFAULT_PERMISSIONS } from "./permissions.service";
import { User, RoleName } from "../types";

export interface SessionLogs {
  id: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED";
}

export const authService = {
  /**
   * Translates a registered User model into a signed secure JWT and registers it in storage
   */
  authenticateUser(user: User): string {
    const payload = {
      userId: user.id,
      fullName: user.fullName,
      roleName: user.roleId as RoleName,
      agencyId: user.agencyId,
      permissions: ROLE_DEFAULT_PERMISSIONS[user.roleId] || []
    };

    const token = jwtService.generateMockJWT(payload);
    jwtService.saveToken(token);
    return token;
  },

  /**
   * Verifies the active token and returns the decoupled metadata context
   */
  getCurrentSessionUser(): TokenPayload | null {
    const token = jwtService.getToken();
    if (!token) return null;
    return jwtService.decodeAndValidate(token);
  },

  /**
   * Logs out the user session
   */
  logout() {
    jwtService.clearToken();
  },

  /**
   * Implements simulated multi-factor authentication (MFA) validation
   */
  async validateMFA(code: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(code === "123456" || code.length === 6);
      }, 500);
    });
  },

  /**
   * Retrieves active security logs for audit and compliance displays
   */
  getSecurityLogs(userId: string): SessionLogs[] {
    return [
      { id: "log-1", ipAddress: "197.149.22.4", userAgent: "Mozilla/5.0 Chrome/124.0.0.0", timestamp: "Aujourd'hui à 14:23", status: "SUCCESS" },
      { id: "log-2", ipAddress: "197.149.22.4", userAgent: "Mozilla/5.0 Safari/605.1", timestamp: "Hier à 09:12", status: "SUCCESS" },
      { id: "log-3", ipAddress: "41.223.101.9", userAgent: "Firefox/120.0", timestamp: "Il y a 3 jours à 18:44", status: "FAILED" }
    ];
  }
};
