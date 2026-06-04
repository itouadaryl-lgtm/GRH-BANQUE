import type { Express } from "express";
import bcrypt from "bcryptjs";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("123", 12);

export function registerEmployeesRoutes(app: Express, db: Database): void {
  app.get("/api/employees", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    let list = db.users;
    if (!isVoirTout) {
      list = db.users.filter((u) => u.agencyId === currentUser.agencyId);
    }
    const safe = list.map(({ passwordHash: _p, ...rest }) => rest);
    res.json({ success: true, data: safe });
  });

  app.put("/api/employees/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const {
      matricule,
      email,
      firstName,
      lastName,
      phone,
      birthDate,
      hireDate,
      department,
      position,
      agencyId,
      roleId,
      status,
      photoUrl,
    } = req.body;
    const userIdx = db.users.findIndex((u) => u.id === id);
    if (userIdx !== -1) {
      db.users[userIdx] = {
        ...db.users[userIdx],
        matricule: matricule !== undefined ? matricule : db.users[userIdx].matricule,
        email: email !== undefined ? email : db.users[userIdx].email,
        firstName: firstName !== undefined ? firstName : db.users[userIdx].firstName,
        lastName: lastName !== undefined ? lastName : db.users[userIdx].lastName,
        fullName:
          firstName !== undefined || lastName !== undefined
            ? `${firstName || db.users[userIdx].firstName} ${lastName || db.users[userIdx].lastName}`
            : db.users[userIdx].fullName,
        phone: phone !== undefined ? phone : db.users[userIdx].phone,
        birthDate: birthDate !== undefined ? birthDate : db.users[userIdx].birthDate,
        hireDate: hireDate !== undefined ? hireDate : db.users[userIdx].hireDate,
        department: department !== undefined ? department : db.users[userIdx].department,
        position: position !== undefined ? position : db.users[userIdx].position,
        agencyId: agencyId !== undefined ? agencyId : db.users[userIdx].agencyId,
        roleId: roleId !== undefined ? roleId : db.users[userIdx].roleId,
        status: status !== undefined ? status : db.users[userIdx].status,
        photoUrl: photoUrl !== undefined ? photoUrl : db.users[userIdx].photoUrl,
      };
      addAuditLog(db, currentUser.id, "UPDATE", "User", db.users[userIdx].fullName);
      db.scheduleSave();
      const { passwordHash: _p, ...safe } = db.users[userIdx];
      return res.json({ success: true, message: "Profil collaborateur mis à jour !", data: safe });
    }
    res.status(404).json({ success: false, message: "Collaborateur introuvable" });
  });

  app.delete("/api/employees/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const userIdx = db.users.findIndex((u) => u.id === id);
    if (userIdx !== -1) {
      const deletedUser = db.users[userIdx];
      db.users.splice(userIdx, 1);
      addAuditLog(db, currentUser.id, "DELETE", "User", deletedUser.fullName);
      db.scheduleSave();
      return res.json({ success: true, message: "Collaborateur supprimé définitivement !" });
    }
    res.status(404).json({ success: false, message: "Collaborateur introuvable" });
  });

  app.post("/api/employees", (req, res) => {
    const currentUser = getReqUser(req);
    const {
      matricule,
      email,
      firstName,
      lastName,
      phone,
      birthDate,
      hireDate,
      department,
      position,
      agencyId,
      roleId,
      status,
    } = req.body;

    if (db.users.some((u) => u.matricule === matricule)) {
      return res.status(400).json({ success: false, message: "Un collaborateur possède déjà ce matricule !" });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      matricule,
      email,
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      photoUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      phone,
      birthDate,
      hireDate,
      department,
      position,
      agencyId: agencyId || currentUser.agencyId,
      roleId: roleId || "role-employee",
      status: status || "ACTIVE",
      failedLoginAttempts: 0,
    };

    db.users.push(newUser);
    addAuditLog(db, currentUser.id, "IMPORT", "User", newUser.fullName);
    db.scheduleSave();

    const { passwordHash: _p, ...safe } = newUser;
    res.json({ success: true, message: "Collaborateur ajouté avec succès !", data: safe });
  });
}
