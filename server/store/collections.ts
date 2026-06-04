// server/store/collections.ts

export const COLLECTIONS = [
  "agencies",
  "roles",
  "permissions",
  "systemParameters",
  "categories",
  "documentTypes",
  "users",
  "folders",
  "documents",
  "accessRequests",
  "activityLogs",
  "professionalCards",
  "chatMessages",
  "leaveRequests",
  "recruitmentJobs",
  "recruitmentApplications",
  "financeTransactions",
  "userNotifications",
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

export type StorePayload = Record<CollectionName, Record<string, unknown>[]>;

export const COLLECTION_TABLES: Record<CollectionName, string> = {
  agencies: "grh_agencies",
  roles: "grh_roles",
  permissions: "grh_permissions",
  systemParameters: "grh_system_parameters",
  categories: "grh_categories",
  documentTypes: "grh_document_types",
  users: "grh_users",
  folders: "grh_folders",
  documents: "grh_documents",
  accessRequests: "grh_access_requests",
  activityLogs: "grh_activity_logs",
  professionalCards: "grh_professional_cards",
  chatMessages: "grh_chat_messages",
  leaveRequests: "grh_leave_requests",
  recruitmentJobs: "grh_recruitment_jobs",
  recruitmentApplications: "grh_recruitment_applications",
  financeTransactions: "grh_finance_transactions",
  userNotifications: "grh_user_notifications",
};

export function emptyPayload(): StorePayload {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, []])) as StorePayload;
}
