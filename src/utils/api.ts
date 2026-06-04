// src/utils/api.ts — réexport vers api.client (compatibilité)

export {
  api,
  queryClient,
  getAuthHeaders,
  GRH_TOKEN_KEY,
  GRH_USER_KEY,
} from "../services/api.client";

/** @deprecated Utiliser GRH_TOKEN_KEY */
export { GRH_TOKEN_KEY as AUTH_TOKEN_KEY } from "../services/api.client";
