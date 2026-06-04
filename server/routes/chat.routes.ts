import type { Express } from "express";
import { GoogleGenAI } from "@google/genai";
import type { Database } from "../store/database.js";
import { getReqUser } from "../middleware/auth.js";

export function registerChatRoutes(app: Express, db: Database): void {
  app.delete("/api/chat/history/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.chatMessages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      db.chatMessages.splice(idx, 1);
      db.scheduleSave();
      return res.json({ success: true, message: "Message de l'historique effacé !" });
    }
    res.status(404).json({ success: false, message: "Message introuvable" });
  });

  app.post("/api/chat/message", async (req, res) => {
    const currentUser = getReqUser(req);
    const { message, sessionId } = req.body;

    const currentSessionId = sessionId || "sess-default";

    const userMsg = {
      id: `m-${Date.now()}-usr`,
      userId: currentUser.id,
      sessionId: currentSessionId,
      role: "user",
      message,
      sentAt: new Date().toISOString(),
    };
    db.chatMessages.push(userMsg);

    const history = db.chatMessages.filter(
      (m) => m.userId === currentUser.id && m.sessionId === currentSessionId
    );

    const systemInstructions = `Tu es ARHI (Archives RH Intelligent), l'assistant virtuel officiel du système AFG BANK Archives RH.
Tu réponds aux collaborateurs et aux gestionnaires RH pour les aider dans la consultation de documents, l'utilisation de l'application et la compréhension des procédures de la banque.
Informations système utiles pour répondre :
- Nombre total de documents dans le coffre : 1248 (dont 35% de Contrats, 25% de Bulletins de Paie, 15% d'Attestations, 15% CNSS/CNAS)
- Nombre de collaborateurs actifs indexés : 320 collaborateurs.
- Rétention de la Corbeille : 30 jours (la corbeille élimine automatiquement les documents après ce délai).
- Rôles : SUPER_ADMIN (Aimé Mbili a ce rôle), ADMIN, DRH, RH_MANAGER (Marie Claire), AUDITOR, AGENT_ADMIN, EMPLOYEE, RETIRED.
Sois toujours poli, professionnel, concis et réponds en Français. Si la question est totalement hors sujet et n'a aucun lien avec AFG Bank ou la gestion RH, indique poliment tes compétences spécifiques.`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.length < 10) {
        let fallbackReply = `[ARHI - Mode Simulation Clinique] Bonjour ${currentUser.firstName} ! J'ai bien reçu votre demande : "${message}".\n\n`;
        
        // Réponses contextuelles pour biométrie/coffres-forts
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("biométrique") || lowerMsg.includes("4x4")) {
          fallbackReply += `**Procédure photo 4x4 biométrique AFG Bank :**\n`;
          fallbackReply += `1. Rendez-vous sur l'onglet "Employés" puis sélectionnez le collaborateur.\n`;
          fallbackReply += `2. Cliquez "Importer photo 4x4" - format requis : JPG/PNG, fond clair, pas de lunettes.\n`;
          fallbackReply += `3. L'image est hashée SHA-256 et liée au dossier RH.\n`;
          fallbackReply += `4. Génération du badge pro via "Cartes Professionnelles".\n\n`;
        }
        if (lowerMsg.includes("coffre") || lowerMsg.includes("archive")) {
          fallbackReply += `**Localisation des coffres-forts numériques :**\n`;
          fallbackReply += `• Siège Libreville : armoire 1, rack 4 (données 2026+)\n`;
          fallbackReply += `• Libreville Centre : armoire 2, rack 2 (documents CNSS)\n`;
          fallbackReply += `• Owendo : armoire 3, rack 1 (PI/RH)\n`;
          fallbackReply += `• Port-Gentil : armoire 4, rack 3 (audit externe)\n\n`;
        }
        
        fallbackReply += `Le système d'Archives RH d'AFG BANK comptabilise actuellement **1 248 documents** hautement sécurisés. Pour activer l'IA cloud Gemini, configurez la clé dans .env.local.`;

        const aiMsg = {
          id: `m-${Date.now()}-ai`,
          userId: currentUser.id,
          sessionId: currentSessionId,
          role: "model",
          message: fallbackReply,
          sentAt: new Date().toISOString(),
        };
        db.chatMessages.push(aiMsg);
        db.scheduleSave();

        return res.json({
          success: true,
          data: {
            sessionId: currentSessionId,
            message: fallbackReply,
            history: db.chatMessages.filter(
              (m) => m.userId === currentUser.id && m.sessionId === currentSessionId
            ),
          },
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: message,
        config: {
          systemInstruction: systemInstructions,
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      });

      const reply = response.text || "Désolé, je n'ai pas pu générer de réponse intelligible à cet instant.";

      const aiMsg = {
        id: `m-${Date.now()}-ai`,
        userId: currentUser.id,
        sessionId: currentSessionId,
        role: "model",
        message: reply,
        sentAt: new Date().toISOString(),
      };
      db.chatMessages.push(aiMsg);
      db.scheduleSave();

      res.json({
        success: true,
        data: {
          sessionId: currentSessionId,
          message: reply,
          history: db.chatMessages.filter(
            (m) => m.userId === currentUser.id && m.sessionId === currentSessionId
          ),
        },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Gemini Assistant Failure:", error);
      const apiErrorResponse = `Bonjour ! J'ai rencontré un contretemps lors de la discussion cloud avec l'API Gemini : "${err.message || error}". Veuillez verifier vos quotas d'API ou réessayer dans un instant.`;
      res.json({
        success: true,
        data: {
          sessionId: currentSessionId,
          message: apiErrorResponse,
          history: db.chatMessages.filter(
            (m) => m.userId === currentUser.id && m.sessionId === currentSessionId
          ),
        },
      });
    }
  });

  app.get("/api/chat/history", (req, res) => {
    const currentUser = getReqUser(req);
    const sessionId = req.query.sessionId || "sess-default";
    const history = db.chatMessages.filter(
      (m) => m.userId === currentUser.id && m.sessionId === sessionId
    );
    res.json({ success: true, data: history });
  });
}
