import NodeCache from "node-cache";

// Initialise un cache en mémoire avec un TTL par défaut de 5 minutes (300 secondes)
export const apiCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false, // Optimisation performance : évite de cloner les objets volumineux
});

// Clés de cache standardisées
export const CACHE_KEYS = {
  PERMISSIONS: "permissions_list",
  ROLES: "roles_list",
  AGENCIES: "agencies_list",
};
