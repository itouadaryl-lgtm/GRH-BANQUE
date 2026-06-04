import type { Express } from "express";
import bcrypt from "bcryptjs";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { getReqUser } from "../middleware/auth.js";

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("123", 12);

export function registerWorkflowRoutes(app: Express, db: Database): void {
  app.get("/api/leave-requests", (req, res) => {
    const currentUser = getReqUser(req);
    const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
    const isHR =
      roleObj?.name === "DRH" ||
      roleObj?.name === "RH_MANAGER" ||
      roleObj?.name === "SUPER_ADMIN";
    const isAgencyAdmin = roleObj?.name === "ADMIN";

    if (isHR || currentUser.roleId === "role-super-admin") {
      return res.json({ success: true, data: db.leaveRequests });
    }
    if (isAgencyAdmin) {
      const agencyEmployeeIds = db.users
        .filter((u) => u.agencyId === currentUser.agencyId)
        .map((u) => u.id);
      const filtered = db.leaveRequests.filter((lr) =>
        agencyEmployeeIds.includes(lr.employeeId as string)
      );
      return res.json({ success: true, data: filtered });
    }
    const filtered = db.leaveRequests.filter((lr) => lr.employeeId === currentUser.id);
    return res.json({ success: true, data: filtered });
  });

  app.post("/api/leave-requests", (req, res) => {
    const currentUser = getReqUser(req);
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs requis de demande de congé doivent être fournis.",
      });
    }

    const newRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      type,
      startDate,
      endDate,
      status: "PENDING",
      reason,
      approvedBy: "",
      approvedAt: "",
      approverComment: "",
    };

    db.leaveRequests.push(newRequest);

    db.users
      .filter(
        (u) =>
          u.roleId === "role-drh" ||
          u.roleId === "role-super-admin" ||
          u.roleId === "role-rh-manager"
      )
      .forEach((hr) => {
        db.userNotifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: hr.id,
          title: "Nouvelle demande de congé",
          message: `L'agent ${currentUser.fullName} a soumis une demande de congé (${type}) du ${startDate} au ${endDate}.`,
          status: "UNREAD",
          type: "INFO",
          createdAt: new Date().toISOString(),
        });
      });

    addAuditLog(db, currentUser.id, "UPDATE", "LeaveRequest", `Création de la demande ${newRequest.id}`, req.ip);
    db.scheduleSave();

    res.json({ success: true, message: "Demande de congé enregistrée avec succès !", data: newRequest });
  });

  app.put("/api/leave-requests/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { status, approverComment } = req.body;

    const idx = db.leaveRequests.findIndex((lr) => lr.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Demande de congé introuvable." });
    }

    const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
    const canApprove =
      roleObj?.name === "DRH" ||
      roleObj?.name === "RH_MANAGER" ||
      roleObj?.name === "SUPER_ADMIN" ||
      roleObj?.name === "ADMIN";

    if (!canApprove) {
      return res.status(403).json({
        success: false,
        message: "Habilitations insuffisantes pour arbitrer les requêtes de congés payés.",
      });
    }

    db.leaveRequests[idx].status = status;
    db.leaveRequests[idx].approvedBy = currentUser.fullName;
    db.leaveRequests[idx].approvedAt = new Date().toISOString();
    db.leaveRequests[idx].approverComment = approverComment || "";

    db.userNotifications.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: db.leaveRequests[idx].employeeId,
      title: `Demande de congé ${status === "APPROVED" ? "Approuvée" : "Refusée"}`,
      message: `Votre demande de congé de type ${db.leaveRequests[idx].type} a été arbitrée par ${currentUser.fullName} avec le statut : ${status}.`,
      status: "UNREAD",
      type: status === "APPROVED" ? "SUCCESS" : "WARNING",
      createdAt: new Date().toISOString(),
    });

    if (status === "APPROVED") {
      const userIdx = db.users.findIndex((u) => u.id === db.leaveRequests[idx].employeeId);
      if (userIdx !== -1) {
        db.users[userIdx].status = "ON_LEAVE";
      }
    }

    addAuditLog(db, currentUser.id, "UPDATE", "LeaveRequest", `Arbitrage de la demande ${id} : ${status}`, req.ip);
    db.scheduleSave();

    res.json({
      success: true,
      message: `Demande de congé ${status === "APPROVED" ? "approuvée" : "rejetée"} avec succès !`,
      data: db.leaveRequests[idx],
    });
  });

  app.get("/api/recruitment/jobs", (_req, res) => {
    res.json({ success: true, data: db.recruitmentJobs });
  });

  app.post("/api/recruitment/jobs", (req, res) => {
    const currentUser = getReqUser(req);
    const { title, department, description, location, salaryRange } = req.body;

    const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
    const isHR =
      roleObj?.name === "DRH" || roleObj?.name === "SUPER_ADMIN" || roleObj?.name === "RH_MANAGER";
    if (!isHR) {
      return res.status(403).json({
        success: false,
        message: "Seul le pôle central de recrutement DRH peut publier des offres.",
      });
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title,
      department,
      description,
      location,
      salaryRange,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    db.recruitmentJobs.unshift(newJob);
    addAuditLog(db, currentUser.id, "UPDATE", "JobOffer", `Publication de l'offre : ${title}`, req.ip);
    db.scheduleSave();
    res.json({ success: true, message: "Offre de recrutement publiée avec brio !", data: newJob });
  });

  app.put("/api/recruitment/jobs/:id", (req, res) => {
    const { id } = req.params;
    const { title, department, description, location, salaryRange, status } = req.body;

    const idx = db.recruitmentJobs.findIndex((j) => j.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Offre introuvable." });
    }

    db.recruitmentJobs[idx] = {
      ...db.recruitmentJobs[idx],
      title: title ?? db.recruitmentJobs[idx].title,
      department: department ?? db.recruitmentJobs[idx].department,
      description: description ?? db.recruitmentJobs[idx].description,
      location: location ?? db.recruitmentJobs[idx].location,
      salaryRange: salaryRange ?? db.recruitmentJobs[idx].salaryRange,
      status: status ?? db.recruitmentJobs[idx].status,
    };

    db.scheduleSave();
    res.json({ success: true, message: "Offre de recrutement mise à jour !", data: db.recruitmentJobs[idx] });
  });

  app.delete("/api/recruitment/jobs/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const idx = db.recruitmentJobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      db.recruitmentJobs.splice(idx, 1);
      addAuditLog(db, currentUser.id, "DELETE", "JobOffer", `Suppression de l'offre ${id}`, req.ip);
      db.scheduleSave();
      return res.json({ success: true, message: "Offre d'emploi supprimée définitivement" });
    }
    res.status(404).json({ success: false, message: "Offre d'emploi introuvable" });
  });

  app.get("/api/recruitment/applications", (_req, res) => {
    res.json({ success: true, data: db.recruitmentApplications });
  });

  app.post("/api/recruitment/applications", (req, res) => {
    const { jobId, candidateName, candidateEmail, resumeUrl } = req.body;
    const targetJob = db.recruitmentJobs.find((j) => j.id === jobId);

    const newApp = {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: targetJob ? targetJob.title : "Poste Indéterminé",
      candidateName,
      candidateEmail,
      resumeUrl: resumeUrl || "CV_Candidat.pdf",
      status: "APPLIED",
      notes: "Candidature insérée.",
      interviewDate: "",
      testScore: 0,
    };

    db.recruitmentApplications.push(newApp);
    db.scheduleSave();
    res.json({ success: true, message: "Votre candidature a été transmise à notre cellule RH !", data: newApp });
  });

  app.put("/api/recruitment/applications/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { status, notes, interviewDate, testScore } = req.body;

    const idx = db.recruitmentApplications.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Dossier de candidature introuvable" });
    }

    db.recruitmentApplications[idx].status = status;
    if (notes !== undefined) db.recruitmentApplications[idx].notes = notes;
    if (interviewDate !== undefined) db.recruitmentApplications[idx].interviewDate = interviewDate;
    if (testScore !== undefined) db.recruitmentApplications[idx].testScore = testScore;

    if (status === "HIRED") {
      const candidate = db.recruitmentApplications[idx];
      const candidateNames = String(candidate.candidateName).split(" ");
      const firstName = candidateNames[0] || "Candidat";
      const lastName = candidateNames.slice(1).join(" ") || "Embauché";
      const matricule = `EMP0${Date.now().toString().substring(10)}`;

      const newHiredUser = {
        id: `u-${Date.now()}`,
        matricule,
        email: String(
          candidate.candidateEmail ||
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}@afgbank.ga`
        ),
        passwordHash: DEFAULT_PASSWORD_HASH,
        firstName,
        lastName,
        fullName: String(candidate.candidateName),
        photoUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        phone: "+241 77 00 11 22",
        birthDate: "1995-01-01",
        hireDate: new Date().toISOString().substring(0, 10),
        department: "Opérations Branches",
        position: `Nouvel Agent — ${candidate.jobTitle}`,
        agencyId: "ag-libreville",
        roleId: "role-employee",
        status: "ACTIVE",
        failedLoginAttempts: 0,
      };

      db.users.push(newHiredUser);

      db.folders.push({
        id: `f-${newHiredUser.id}`,
        name: `Dossier Employé - ${newHiredUser.fullName}`,
        type: "EMPLOYEE",
        ownerId: newHiredUser.id,
        agencyId: "ag-libreville",
        description: `Coffre numérique d'onboarding suite à embauche directe de l'offre.`,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      });

      addAuditLog(
        db,
        currentUser.id,
        "IMPORT",
        "User",
        `Onboarding automatique de ${candidate.candidateName} via embauche recrutement`,
        req.ip
      );
    }

    db.scheduleSave();
    res.json({
      success: true,
      message: "Statut de recrutement actualisé et audité !",
      data: db.recruitmentApplications[idx],
    });
  });
}
