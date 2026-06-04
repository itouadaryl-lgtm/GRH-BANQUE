import { api, apiGet, apiMutate, GRH_TOKEN_KEY } from "../services/api.client";
import type { Document, Role, SystemParameter, ActivityLog, ProfessionalCard, User, Agency, AccessRequest, Folder } from "../types";

export interface SessionUser {
  id: string;
  matricule: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl?: string;
  position?: string;
  department?: string;
  roleName?: string;
  permissions?: string[];
  agencyId?: string;
}

export async function login(matricule: string, password: string) {
  try {
    const res = await api.post("/api/auth/login", { matricule, password });
    if (res.data?.success && res.data.data?.accessToken) {
      localStorage.setItem(GRH_TOKEN_KEY, res.data.data.accessToken ?? res.data.data.token);
      return res.data.data as { accessToken: string; user: SessionUser };
    }
    throw new Error(res.data?.message || "Échec de connexion");
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      throw new Error(axiosErr.response?.data?.message || "Identifiants incorrects");
    }
    throw err;
  }
}

export function logout() {
  localStorage.removeItem(GRH_TOKEN_KEY);
  localStorage.removeItem("grh_user");
}

export const grhApi = {
  fetchMe: (voirTout = false) => apiGet<SessionUser>("/api/auth/me", voirTout),
  fetchStats: (voirTout = false) => apiGet<Record<string, unknown>>("/api/dashboard/stats", voirTout),
  fetchDocuments: (voirTout = false) => apiGet<Document[]>("/api/documents", voirTout),
  fetchEmployees: (voirTout = false) => apiGet<User[]>("/api/employees", voirTout),
  fetchRoles: (voirTout = false) => apiGet<Role[]>("/api/roles", voirTout),
  fetchParameters: (voirTout = false) => apiGet<SystemParameter[]>("/api/system-parameters", voirTout),
  fetchActivityLogs: (voirTout = false) => apiGet<ActivityLog[]>("/api/activity-logs", voirTout),
  fetchCards: (voirTout = false) => apiGet<ProfessionalCard[]>("/api/professional-cards", voirTout),
  fetchAccessRequests: (voirTout = false) => apiGet<AccessRequest[]>("/api/access-requests", voirTout),
  fetchAgencies: (voirTout = false) => apiGet<Agency[]>("/api/agencies", voirTout),
  fetchFolders: (voirTout = false) => apiGet<Folder[]>("/api/folders", voirTout),

  uploadDocument: (payload: unknown, voirTout = false) =>
    apiMutate<Document>("/api/documents", "POST", payload, voirTout),
  deleteDocument: (id: string, voirTout = false) =>
    apiMutate(`/api/documents/${id}`, "DELETE", undefined, voirTout),
  restoreDocument: (id: string, voirTout = false) =>
    apiMutate(`/api/documents/${id}/restore`, "POST", undefined, voirTout),
  permanentDeleteDocument: (id: string, voirTout = false) =>
    apiMutate(`/api/documents/${id}/permanent`, "DELETE", undefined, voirTout),
  emptyTrash: (voirTout = false) => apiMutate("/api/trash/empty", "DELETE", undefined, voirTout),
  generateCard: (employeeId: string, voirTout = false) =>
    apiMutate<ProfessionalCard>(`/api/professional-cards/generate/${employeeId}`, "POST", undefined, voirTout),
  saveRolePermissions: (roleId: string, permissions: string[], voirTout = false) =>
    apiMutate(`/api/roles/${roleId}`, "PUT", { permissions }, voirTout),
  addEmployee: (payload: unknown, voirTout = false) =>
    apiMutate<User>("/api/employees", "POST", payload, voirTout),
  updateEmployee: (id: string, payload: unknown, voirTout = false) =>
    apiMutate<User>(`/api/employees/${id}`, "PUT", payload, voirTout),
  deleteEmployee: (id: string, voirTout = false) =>
    apiMutate(`/api/employees/${id}`, "DELETE", undefined, voirTout),
  createAgency: (payload: unknown, voirTout = false) =>
    apiMutate("/api/agencies", "POST", payload, voirTout),
  updateAgency: (id: string, payload: unknown, voirTout = false) =>
    apiMutate(`/api/agencies/${id}`, "PUT", payload, voirTout),
  deleteAgency: (id: string, voirTout = false) =>
    apiMutate(`/api/agencies/${id}`, "DELETE", undefined, voirTout),
  createFolder: (payload: unknown, voirTout = false) =>
    apiMutate("/api/folders", "POST", payload, voirTout),
  updateFolder: (id: string, payload: unknown, voirTout = false) =>
    apiMutate(`/api/folders/${id}`, "PUT", payload, voirTout),
  deleteFolder: (id: string, voirTout = false) =>
    apiMutate(`/api/folders/${id}`, "DELETE", undefined, voirTout),
  saveParameter: (key: string, value: string, voirTout = false) =>
    apiMutate(`/api/system-parameters/${key}`, "PUT", { paramValue: value }, voirTout),
  toggleVoirTout: (active: boolean) =>
    apiMutate("/api/audit-voir-tout", "POST", { active }),
};

export const grhQueryKeys = {
  all: ["grh"] as const,
  me: (voirTout: boolean) => ["grh", "me", voirTout] as const,
  stats: (voirTout: boolean) => ["grh", "stats", voirTout] as const,
  documents: (voirTout: boolean) => ["grh", "documents", voirTout] as const,
  employees: (voirTout: boolean) => ["grh", "employees", voirTout] as const,
  roles: (voirTout: boolean) => ["grh", "roles", voirTout] as const,
  parameters: (voirTout: boolean) => ["grh", "parameters", voirTout] as const,
  activityLogs: (voirTout: boolean) => ["grh", "activityLogs", voirTout] as const,
  cards: (voirTout: boolean) => ["grh", "cards", voirTout] as const,
  accessRequests: (voirTout: boolean) => ["grh", "accessRequests", voirTout] as const,
  agencies: (voirTout: boolean) => ["grh", "agencies", voirTout] as const,
  folders: (voirTout: boolean) => ["grh", "folders", voirTout] as const,
};
