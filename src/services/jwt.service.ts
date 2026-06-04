/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TokenPayload {
  userId: string;
  fullName: string;
  roleName: string;
  agencyId: string;
  permissions: string[];
  exp: number;
}

export const jwtService = {
  /**
   * Generates a realistic JWT-like token with base64 encoded header, payload, and signature
   */
  generateMockJWT(payload: Omit<TokenPayload, "exp">): string {
    const header = { alg: "HS256", typ: "JWT" };
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12 hours expiry
    const fullPayload: TokenPayload = { ...payload, exp };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(fullPayload));
    const signature = btoa(`HMAC-SHA256-SIGNATURE-AFGBANK-${payload.userId}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  /**
   * Decodes and validates a token
   */
  decodeAndValidate(token: string): TokenPayload | null {
    try {
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payloadJson = atob(parts[1]);
      const payload: TokenPayload = JSON.parse(payloadJson);

      // Check expiry (in seconds)
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowInSeconds) {
        console.warn("[JWT Service] Token has expired.");
        return null;
      }

      return payload;
    } catch (e) {
      console.error("[JWT Service] Failed to parse JWT token:", e);
      return null;
    }
  },

  /**
   * Local storage management
   */
  saveToken(token: string) {
    localStorage.setItem("afg_auth_token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("afg_auth_token");
  },

  clearToken() {
    localStorage.removeItem("afg_auth_token");
  }
};
