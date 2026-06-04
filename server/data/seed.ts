import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("123", 12);

function user(
  data: Omit<Record<string, unknown>, "passwordHash"> & { id: string }
) {
  return { ...data, passwordHash: DEFAULT_PASSWORD_HASH, failedLoginAttempts: 0 };
}

export function createSeedData() {
  return {
    agencies: [
      { id: "ag-siege", code: "SIEGE", name: "AFG BANK Siège Social", address: "Boulevard Triomphal", city: "Libreville", phone: "+241 11 76 12 00", email: "contact@afgbank.ga", isHeadOffice: true, isActive: true },
      { id: "ag-libreville", code: "AGENCY01", name: "AFG BANK Libreville Centre", address: "Avenue de Cointet", city: "Libreville", phone: "+241 11 76 12 01", email: "agence-libreville@afgbank.ga", isHeadOffice: false, isActive: true },
      { id: "ag-owendo", code: "AGENCY02", name: "AFG BANK Owendo Port", address: "Zone Industrielle Owendo", city: "Owendo", phone: "+241 11 76 12 02", email: "agence-owendo@afgbank.ga", isHeadOffice: false, isActive: true },
      { id: "ag-portgentil", code: "AGENCY03", name: "AFG BANK Port-Gentil", address: "Avenue Savorgnan de Brazza", city: "Port-Gentil", phone: "+241 11 76 12 03", email: "agence-pog@afgbank.ga", isHeadOffice: false, isActive: true },
    ],
    roles: [
      { id: "role-super-admin", name: "SUPER_ADMIN", description: "Accès total au système, toutes les agences, toutes les fonctions.", permissions: ["*"] },
      { id: "role-admin", name: "ADMIN", description: "Administrateur d'agence : gestion des utilisateurs et rôles locaux.", permissions: ["USER_READ", "USER_CREATE", "USER_UPDATE", "ROLE_ASSIGN", "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "AGENCY_VIEW", "CHATBOT_ACCESS"] },
      { id: "role-drh", name: "DRH", description: "Directeur des Ressources Humaines : gestion globale documentaire, validation des demandes.", permissions: ["EMPLOYEE_READ", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE", "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE", "DOCUMENT_RESTORE", "CARD_GENERATE", "ACCESS_REQUEST_APPROVE", "AUDIT_LOG_READ", "AGENCY_VIEW", "AGENCY_VIEW_ALL", "CHATBOT_ACCESS", "ROLE_ASSIGN"] },
      { id: "role-rh-manager", name: "RH_MANAGER", description: "Gestionnaire RH : consultation, validation intermédiaire et import/export.", permissions: ["EMPLOYEE_READ", "EMPLOYEE_CREATE", "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "CARD_GENERATE", "ACCESS_REQUEST_CREATE", "AGENCY_VIEW", "CHATBOT_ACCESS"] },
      { id: "role-auditor", name: "AUDITOR", description: "Auditeur externe ou interne : lecture seule et inspection des logs d'activités.", permissions: ["EMPLOYEE_READ", "DOCUMENT_READ", "AUDIT_LOG_READ", "AGENCY_VIEW", "AGENCY_VIEW_ALL"] },
      { id: "role-agent-admin", name: "AGENT_ADMIN", description: "Agent administratif : téléversement documentaire et indexation.", permissions: ["DOCUMENT_CREATE", "DOCUMENT_READ", "AGENCY_VIEW", "CHATBOT_ACCESS"] },
      { id: "role-employee", name: "EMPLOYEE", description: "Employé de la banque : consultation exclusive de son propre dossier.", permissions: ["OWN_DOCUMENT_READ", "AGENCY_VIEW", "CHATBOT_ACCESS"] },
      { id: "role-retired", name: "RETIRED", description: "Ancien employé ou retraité : consultation de ses archives de fin de carrière.", permissions: ["OWN_DOCUMENT_READ"] },
      { id: "role-comptable", name: "COMPTABLE", description: "Cabinet Comptable & Budgétaire : paiement de salaires, taxes Gabonaises, rapports financiers.", permissions: ["FINANCE_READ", "FINANCE_CREATE", "FINANCE_UPDATE", "AGENCY_VIEW", "CHATBOT_ACCESS"] },
      { id: "role-client", name: "CLIENT", description: "Client Externe Partenaire : suivi de dossiers de financement et attestations.", permissions: ["CLIENT_READ", "AGENCY_VIEW", "CHATBOT_ACCESS"] },
    ],
    systemParameters: [
      { id: "p1", paramKey: "INSTITUTION_NAME", paramValue: "AFG BANK GABON", description: "Nom institutionnel affiché par la banque", paramType: "STRING", isEditable: true },
      { id: "p2", paramKey: "LOGO_URL", paramValue: "/assets/afgbank_logo.png", description: "URL ou base64 du logo de l'institution", paramType: "URL", isEditable: true },
      { id: "p3", paramKey: "SYSTEM_TIMEZONE", paramValue: "Africa/Libreville (WAT)", description: "Fuseau horaire officiel pour l'horodatage des documents", paramType: "STRING", isEditable: true },
      { id: "p4", paramKey: "DATE_FORMAT", paramValue: "Format 2 (DD/MM/YYYY HH:mm)", description: "Format par défaut pour l'affichage des dates", paramType: "STRING", isEditable: true },
      { id: "p5", paramKey: "RETENTION_DAYS", paramValue: "30", description: "Délai de rétention en jours des documents dans la corbeille", paramType: "INTEGER", isEditable: true },
      { id: "p6", paramKey: "MAX_UPLOAD_SIZE_MB", paramValue: "50", description: "Taille maximale en MegaOctets pour les fichiers", paramType: "INTEGER", isEditable: true },
    ],
    categories: [
      { id: "cat-contrats", name: "Contrats", description: "Contrats de travail, avenants, engagements", isActive: true },
      { id: "cat-paie", name: "Fiches de paie", description: "Bulletins de salaire mensuels, soldes de tout compte", isActive: true },
      { id: "cat-attestations", name: "Attestations", description: "Attestations de travail, de présence, de congés", isActive: true },
      { id: "cat-identite", name: "Pièces d'identité", description: "Passeports, Cartes Nationales d'Identité, cartes d'employé", isActive: true },
      { id: "cat-cnss", name: "Documents CNSS/CNAS", description: "Déclarations, bulletins de cotisations sociales", isActive: true },
      { id: "cat-diplomes", name: "Diplômes et Certificats", description: "Diplômes universitaires, certifications professionnelles", isActive: true },
      { id: "cat-divers", name: "Documents divers", description: "Autres archives administratives", isActive: true },
    ],
    documentTypes: [
      { id: "dt-contrat", name: "Contrat de travail", categoryId: "cat-contrats", description: "Contrats de travail signés par l'employé", isActive: true, iconColor: "blue-500", iconType: "FileText" },
      { id: "dt-avenant", name: "Avenant de contrat", categoryId: "cat-contrats", description: "Avenants de modification de poste ou salaire", isActive: true, iconColor: "cyan-500", iconType: "FileEdit" },
      { id: "dt-paie", name: "Fiche de paie", categoryId: "cat-paie", description: "Bulletins de salaire mensuels", isActive: true, iconColor: "green-500", iconType: "Receipt" },
      { id: "dt-solde", name: "Solde de tout compte", categoryId: "cat-paie", description: "Attestation de solde lors du départ de l'employé", isActive: true, iconColor: "emerald-500", iconType: "Coins" },
      { id: "dt-attestation-travail", name: "Attestation de travail", categoryId: "cat-attestations", description: "Attestations et certificats de travail", isActive: true, iconColor: "amber-500", iconType: "ShieldCheck" },
      { id: "dt-attestation-presence", name: "Attestation de présence", categoryId: "cat-attestations", description: "Attestations de présence ou de service", isActive: true, iconColor: "orange-500", iconType: "CalendarDays" },
      { id: "dt-identite", name: "Pièce d'identité", categoryId: "cat-identite", description: "Cartes d'identité, passeports, etc.", isActive: true, iconColor: "purple-500", iconType: "CreditCard" },
      { id: "dt-diplome", name: "Diplôme", categoryId: "cat-diplomes", description: "Copies des diplômes obtenus", isActive: true, iconColor: "indigo-500", iconType: "GraduationCap" },
      { id: "dt-cnas", name: "Bulletin CNAS", categoryId: "cat-cnss", description: "Bulletins de la Caisse Nationale d'Assurance Santé", isActive: true, iconColor: "rose-500", iconType: "HeartPulse" },
      { id: "dt-cnss", name: "Bulletin CNSS", categoryId: "cat-cnss", description: "Bulletins de la Caisse Nationale de Sécurité Sociale", isActive: true, iconColor: "teal-500", iconType: "FileCheck2" },
      { id: "dt-autres", name: "Autres documents", categoryId: "cat-divers", description: "Tous autres documents administratifs", isActive: false, iconColor: "slate-500", iconType: "Folder" },
    ],
    users: [
      user({ id: "u-aime", matricule: "EMP001", email: "aime.mbili@afgbank.ga", firstName: "Aimé", lastName: "Mbili", fullName: "Aimé Mbili", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", phone: "+241 62 12 34 56", birthDate: "1985-06-15", hireDate: "2015-02-10", department: "Développement Informatique", position: "Directeur de l'Innovation & IT", agencyId: "ag-siege", roleId: "role-super-admin", status: "ACTIVE" }),
      user({ id: "u-marie", matricule: "EMP002", email: "marie.claire@afgbank.ga", firstName: "Marie", lastName: "Claire", fullName: "Marie Claire", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150", phone: "+241 62 98 76 54", birthDate: "1990-10-22", hireDate: "2018-05-18", department: "Gestion des Ressources Humaines", position: "Gestionnaire RH", agencyId: "ag-siege", roleId: "role-rh-manager", status: "ACTIVE" }),
      user({ id: "u-paul", matricule: "EMP003", email: "paul.samba@afgbank.ga", firstName: "Paul", lastName: "Samba", fullName: "Paul Samba", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", phone: "+241 64 11 22 33", birthDate: "1982-12-05", hireDate: "2012-09-01", department: "Comptabilité", position: "Comptable", agencyId: "ag-libreville", roleId: "role-employee", status: "ACTIVE" }),
      user({ id: "u-jean", matricule: "EMP004", email: "jean.mouala@afgbank.ga", firstName: "Jean", lastName: "Mouala", fullName: "Jean Mouala", photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150", phone: "+241 62 33 44 55", birthDate: "1988-03-30", hireDate: "2017-07-20", department: "Chargé de paie", position: "Responsable de Paie", agencyId: "ag-siege", roleId: "role-drh", status: "ACTIVE" }),
      user({ id: "u-linda", matricule: "EMP005", email: "linda.obame@afgbank.ga", firstName: "Linda", lastName: "Obame", fullName: "Linda Obame", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", phone: "+241 61 22 33 44", birthDate: "1994-11-12", hireDate: "2020-03-15", department: "Ressources Humaines", position: "Assistante RH", agencyId: "ag-owendo", roleId: "role-agent-admin", status: "ACTIVE" }),
      user({ id: "u-gabriel", matricule: "EMP006", email: "gabriel.ndong@afgbank.ga", firstName: "Gabriel", lastName: "Ndong", fullName: "Gabriel Ndong", photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150", phone: "+241 62 44 55 66", birthDate: "1980-04-04", hireDate: "2010-01-10", department: "Juridique", position: "Juriste", agencyId: "ag-siege", roleId: "role-retired", status: "RETIRED" }),
      user({ id: "u-sophie", matricule: "EMP007", email: "sophie.minko@afgbank.ga", firstName: "Sophie", lastName: "Minko", fullName: "Sophie Minko", photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150", phone: "+241 66 77 88 99", birthDate: "1991-08-19", hireDate: "2019-11-25", department: "Audit Interne", position: "Auditeur Interne", agencyId: "ag-portgentil", roleId: "role-auditor", status: "ACTIVE" }),
      user({ id: "u-david", matricule: "EMP008", email: "david.ekombo@afgbank.ga", firstName: "David", lastName: "Ekombo", fullName: "David Ekombo", photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150", phone: "+241 64 88 99 00", birthDate: "1986-02-14", hireDate: "2016-08-12", department: "Sécurité des Systèmes", position: "Analyste Sécurité", agencyId: "ag-siege", roleId: "role-employee", status: "ACTIVE" }),
      user({ id: "u-comptable", matricule: "AFG260025", email: "pierre.moubamba@afgbank.ga", firstName: "Pierre", lastName: "Moubamba", fullName: "Pierre Moubamba", photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150", phone: "+241 77 26 00 25", birthDate: "1983-04-18", hireDate: "2014-11-01", department: "Cabinet Comptable & Trésorerie", position: "Comptable Principal", agencyId: "ag-siege", roleId: "role-comptable", status: "ACTIVE" }),
      user({ id: "u-admin", matricule: "AFG260099", email: "jean-marc.ndong@afgbank.ga", firstName: "Jean-Marc", lastName: "Ndong", fullName: "Jean-Marc Ndong", photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150", phone: "+241 77 26 00 99", birthDate: "1979-05-12", hireDate: "2011-03-15", department: "Opérations Branches", position: "Administrateur d'Agence Libreville", agencyId: "ag-libreville", roleId: "role-admin", status: "ACTIVE" }),
      user({ id: "u-client", matricule: "AFG-CLI-901", email: "christian.kombila@gmail.com", firstName: "Christian", lastName: "Kombila", fullName: "Christian Kombila", photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150", phone: "+241 65 33 22 11", birthDate: "1994-09-08", hireDate: "2026-05-29", department: "Partenaire Externe", position: "Client Corporat Global", agencyId: "ag-siege", roleId: "role-client", status: "ACTIVE" }),
    ],
    folders: [] as Record<string, unknown>[],
    documents: [] as Record<string, unknown>[],
    accessRequests: [] as Record<string, unknown>[],
    activityLogs: [] as Record<string, unknown>[],
    professionalCards: [] as Record<string, unknown>[],
    chatMessages: [
      { id: "m1", userId: "u-aime", sessionId: "sess-default", role: "model", message: "Bonjour ! Je suis ARHI (Archives RH Intelligent), votre conseiller IA AFG BANK. Comment puis-je vous aider aujourd'hui ? Toutes les données d'archives ont été réinitialisées à zéro.", sentAt: "2026-05-30T00:00:00Z" },
    ],
    permissions: [] as Record<string, unknown>[],
    leaveRequests: [] as Record<string, unknown>[],
    recruitmentJobs: [] as Record<string, unknown>[],
    recruitmentApplications: [] as Record<string, unknown>[],
    financeTransactions: [] as Record<string, unknown>[],
    userNotifications: [] as Record<string, unknown>[],
  };
}
