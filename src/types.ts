/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. AGENCIES
export interface Agency {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  directorName?: string;
  regionCode?: string;
  status: 'active' | 'inactive' | 'closed';
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
  // UI helpers
  isHeadOffice: boolean;
  isActive: boolean;
}

// 2. ROLES
export type RoleName = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DRH'
  | 'RH_MANAGER'
  | 'AUDITOR'
  | 'AGENT_ADMIN'
  | 'EMPLOYEE'
  | 'RETIRED'
  | 'COMPTABLE'
  | 'CLIENT';

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  permissions: string[]; // List of permission codes
}

export interface Permission {
  id: string;
  code: string;
  description: string;
  module: string;
}

// 3. USERS
export type UserStatus = 'active' | 'inactive' | 'suspended';
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roleId: string;
  agencyId: string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // UI Helpers
  matricule?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  photoUrl?: string;
  phone?: string;
  birthDate?: string;
  hireDate?: string;
  departureDate?: string;
  department?: string;
  position?: string;
  failedLoginAttempts?: number;
}

// 4. EMPLOYEES
export interface Employee {
  id: string;
  userId: string; // FK to User
  matricule: string;
  firstName: string;
  lastName: string;
  fullName: string; // Helper for UI
  photoUrl?: string;
  position: string;
  department: string;
  hireDate: string;
  departureDate?: string;
  phone: string;
  birthDate: string;
}

// 5. DOCUMENT TYPES & CATEGORIES
export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface DocumentType {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  isActive: boolean;
  iconColor: string;
  iconType: string;
}

// 6. FOLDERS
export type AccessLevel = 'public' | 'restricted' | 'confidential';
export interface Folder {
  id: string;
  name: string;
  type: string; // 'EMPLOYEE' | 'DEPARTMENT' | 'AGENCY' | 'GENERAL'
  agencyId: string;
  parentFolderId?: string;
  path: string;
  color: string;
  icon: string;
  accessLevel: AccessLevel;
  ownerId?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  // UI helpers
  description: string;
  isDeleted: boolean;
}

// 7. DOCUMENTS
export type DocumentStatus = 'draft' | 'active' | 'archived' | 'deleted';
export interface Document {
  id: string;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  documentTypeId: string;
  folderId?: string;
  agencyId: string;
  uploadedById: string;
  title: string;
  description: string;
  tags: string[];
  status: DocumentStatus;
  version: number;
  parentDocumentId?: string;
  accessLevel: AccessLevel;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // UI helpers
  employeeId?: string; // S'il s'agit d'un document RH
  isDeleted?: boolean;
}

// 8. ACCESS REQUESTS
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export interface AccessRequest {
  id: string;
  documentId: string;
  requesterId: string;
  requestedById: string;
  reason: string;
  status: AccessRequestStatus;
  priority: PriorityLevel;
  reviewedById?: string;
  reviewedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // UI helpers
  documentName?: string;
  requesterName?: string;
  requesterPosition?: string;
  requesterPhotoUrl?: string;
  approverComment?: string;
  requestedAt?: string;
}

// 9. ACTIVITY LOGS
export interface ActivityLog {
  id: string;
  userId: string;
  action: string; // CONSULT, UPLOAD, DELETE, etc.
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  // UI helpers
  userFullName?: string;
  userPhotoUrl?: string;
  userRoleName?: string;
  entityLabel?: string;
  agencyCode?: string;
  agencyId?: string;
}

// 10. PROFESSIONAL CARDS
export type CardStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export interface ProfessionalCard {
  id: string;
  userId: string;
  cardNumber: string; // AFGBANK-{ANNEE}-{MATRICULE}
  issuedAt: string;
  expiresAt: string;
  status: CardStatus;
  photoUrl: string;
  qrCodeData: string;
  issuedById: string;
  createdAt: string;
  updatedAt: string;
  // UI helpers
  employeeId?: string;
  issueDate?: string;
  expiryDate?: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
  generatedAt?: string;
  generatedById?: string;
}

// 11. SYSTEM PARAMETERS
export interface SystemParameter {
  id: string;
  key: string;
  value: string;
  description: string;
  // UI helpers
  paramKey?: string;
  paramValue?: string;
}

// Chat Messages (Gemini Chatbot)
export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'model';
  message: string;
  sentAt: string;
}

// UI HELPER INTERFACE (SessionUser returned by login)
export interface SessionUser {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  agencyId: string;
  permissions: string[];
  employeeId?: string;
  matricule?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  photoUrl?: string;
  position?: string;
  department?: string;
}


