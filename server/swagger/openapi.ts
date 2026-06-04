export const getOpenApiSpec = (host: string) => ({
  openapi: "3.0.3",
  info: {
    title: "AFG BANK GABON — Système Central d’Archives & Accréditations RH",
    version: "1.0.0-PROD",
    description: "### Portails d'API de la Direction des Ressources Humaines & d'Audit d'AFG BANK\n\nCe middleware orchestrateur de classe entreprise assure la consolidation d'arborescence, l'indexation physique cloud, la cryptographie des coffres forts, le traçage continu sous règlementations de l'organisme de régulation **COBAC** et l'accès dictionnaire dynamique par habilitation (RBAC) pour l'entièreté des collaborateurs du Siège et des Branches d'AFG Bank Gabon.\n\n#### Directives de Sécurité Imposées et d'Audit COBAC :\n1. **Authentification forte double** : Signature numérique par jeton JWT de format Bearer avec chiffrement asymétrique en transit.\n2. **Gouvernance RGPD & COBAC / DRC** : Traçabilité absolue de chaque action de consultation, création, modification ou suppression dans le Journal d’Activités (ActivityLog).\n3. **Chiffrement physique** : Indexation unique avec empreinte globale SHA-256 calculée à la volée sur chaque fichier versé.\n4. **Rétention Réglementaire** : Auto-nettoyage des archives d'accréditation sous 30 jours (configurables) via le bac de rétention temporaire local.",
    termsOfService: "https://afgbank.ga/termes-et-conditions-api",
    contact: {
      name: "Aimé Mbili — Directeur Sécurité & Conformité de l'Information",
      email: "aime.mbili@afgbank.ga",
      url: "https://afgbank.ga/security-ops"
    },
    license: {
      name: "Propriété Exclusive d'AFG Bank Gabon S.A. — Droits Réservés",
      url: "https://afgbank.ga/legal-notices"
    }
  },
  servers: [
    {
      url: host.startsWith("localhost") ? `http://${host}` : `https://${host}`,
      description: "Environnement d'Intégration Primaire et Bac à sable Actif"
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Renseignez le jeton d'autorisation généré par l'endpoint /api/auth/login. Exemple: `Bearer u-aime`"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false, description: "Indicateur d'échec de la requête" },
          message: { type: "string", example: "Accès refusé. Habilitations insuffisantes pour cette ressource.", description: "Description textuelle détaillée de l'anomalie" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "u-aime", description: "Identifiant interne unique" },
          matricule: { type: "string", example: "AFG-0524", description: "Matricule officiel de l'agent" },
          email: { type: "string", example: "aime.mbili@afgbank.ga", description: "Adresse de messagerie professionnelle stable" },
          firstName: { type: "string", example: "Aimé", description: "Prénom du collaborateur" },
          lastName: { type: "string", example: "Mbili", description: "Nom patronymique officiel" },
          fullName: { type: "string", example: "Aimé Mbili", description: "Nom complet consolidé" },
          phone: { type: "string", example: "+241 77 12 34 56", description: "Ligne de communication directe ou GSM" },
          birthDate: { type: "string", example: "1984-06-15", description: "Date de naissance enregistrée" },
          hireDate: { type: "string", example: "2018-02-01", description: "Date officielle d'entrée en fonctions" },
          department: { type: "string", example: "Sécurité & Audit", description: "Département ou pôle d'affectation" },
          position: { type: "string", example: "Directeur Sécurité & Conformité de l'Information", description: "Désignation exacte du poste occupé" },
          agencyId: { type: "string", example: "ag-siege", description: "Identifiant de l'agence affiliée locale" },
          roleId: { type: "string", example: "role-super-admin", description: "Rôle de sécurité de l'agent (RBAC)" },
          status: { type: "string", example: "ACTIVE", enum: ["ACTIVE", "SUSPENDED", "RETIRED"], description: "Statut administratif du collaborateur" }
        }
      },
      Document: {
        type: "object",
        properties: {
          id: { type: "string", example: "doc-1", description: "Identifiant universel de l'archive GED" },
          originalFileName: { type: "string", example: "Contrat_Cadre_EOM.pdf", description: "Nom original du fichier téléversé" },
          documentTypeId: { type: "string", example: "dt-contrat", description: "Identifiant du type structuré d'archive" },
          employeeId: { type: "string", example: "u-aime", description: "Identifiant du collaborateur concerné par l'archive" },
          fileSize: { type: "string", example: "2.4 MB", description: "Poids lisible du fichier sur l'armoire physique" },
          sha256: { type: "string", example: "07ef7fc368bcbc...", description: "Empreinte cryptographique immuable pour audit d'intégrité" },
          uploadedById: { type: "string", example: "u-marie", description: "Utilisateur à l'origine du téléversement" },
          version: { type: "integer", example: 1, description: "Numéro de version du document" },
          description: { type: "string", example: "Avenant annuel de reclassification", description: "Notes de synthèse ou description" },
          isDeleted: { type: "boolean", example: false, description: "Indicateur d'archivage temporaire en corbeille" },
          uploadDate: { type: "string", example: "2026-05-28T14:10:00Z", description: "Date et heure de versement dans le dictionnaire" },
          retentionDate: { type: "string", example: "2026-06-27T14:10:00Z", description: "Date limite de rétention avant purge définitive (uniquement si isDeleted est vrai)" }
        }
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "string", example: "role-drh" },
          name: { type: "string", example: "DRH", description: "Code mnémonique du rôle de sécurité" },
          description: { type: "string", example: "Directeur des Ressources Humaines : gestion globale documentaire, validation des demandes." },
          permissions: {
            type: "array",
            items: { type: "string" },
            example: ["EMPLOYEE_READ", "EMPLOYEE_CREATE", "DOCUMENT_READ", "DOCUMENT_CREATE", "*"]
          }
        }
      },
      AccessRequest: {
        type: "object",
        properties: {
          id: { type: "string", example: "req-1524" },
          documentId: { type: "string", example: "doc-1", description: "Document cible restreint" },
          documentName: { type: "string", example: "bulletin_salaire_mars.pdf", description: "Nom consolidé de la pièce" },
          requesterId: { type: "string", example: "u-marie", description: "ID du demandeur de dérogation d'accès" },
          requesterName: { type: "string", example: "Marie Claire", description: "Nom complet consolidé du demandeur" },
          requesterPosition: { type: "string", example: "Gestionnaire de Branches RH" },
          status: { type: "string", example: "PENDING", enum: ["PENDING", "APPROVED", "REJECTED"], description: "Statut d'accréditation réglementaire" },
          reason: { type: "string", example: "Examen d'ancienneté requis pour validation d'avancement.", description: "Motif formel obligatoire pour audit" },
          requestedAt: { type: "string", example: "2026-05-28T14:00:00Z" },
          approvedById: { type: "string", example: "u-aime", description: "Habilité ayant autorisé ou décliné l'accès" },
          approvedAt: { type: "string", example: "2026-05-28T14:15:00Z" },
          approverComment: { type: "string", example: "Accord exceptionnel pour audit interne d'avancement.", description: "Commentaire officiel de l'approbateur" }
        }
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { type: "string", example: "log-524" },
          userId: { type: "string", example: "u-aime" },
          userFullName: { type: "string", example: "Aimé Mbili", description: "Nom de l'agent rattaché à l'action d'audit" },
          userEmail: { type: "string", example: "aime.mbili@afgbank.ga" },
          action: { type: "string", example: "UPLOAD", enum: ["LOGIN", "LOGOUT", "UPLOAD", "DOWNLOAD", "DELETE", "RESTORE", "PERM_DELETE", "CARD_GENERATE", "IMPORT", "UPDATE"], description: "Nature de l'opération surveillée" },
          resource: { type: "string", example: "Document", description: "Type d'entité manipulée" },
          target: { type: "string", example: "Contrat_Cadre_EOM.pdf", description: "Désignation ou ID de la ressource affectée" },
          timestamp: { type: "string", example: "2026-05-28T14:10:02Z", description: "Date et Heure immuables" },
          ipAddress: { type: "string", example: "10.12.1.45", description: "Adresse IP locale du terminal de la banque" },
          userAgent: { type: "string", example: "Mozilla/5.0...", description: "Signature du terminal de navigation" }
        }
      },
      ProfessionalCard: {
        type: "object",
        properties: {
          id: { type: "string", example: "card-524" },
          employeeId: { type: "string", example: "u-aime" },
          employeeName: { type: "string", example: "Sophie Dougou" },
          employeeMatricule: { type: "string", example: "AFG-0524" },
          employeePosition: { type: "string", example: "Analyste de Crédit Senior" },
          cardNumber: { type: "string", example: "AFGBANK-2024-AFG-0524", description: "Numéro de badge unique d'identification" },
          issueDate: { type: "string", example: "2026-05-28" },
          expiryDate: { type: "string", example: "2028-05-28", description: "Date de fin de validité réglementaire" },
          qrCodeUrl: { type: "string", example: "https://archives-rh.afgbank.ga/verify/card/AFGBANK-2024-AFG-0524", description: "Lien de vérification par scanner d'agence" },
          status: { type: "string", example: "ACTIVE", enum: ["ACTIVE", "EXPIRED", "REVOKED"], description: "Statut physique de validité du badge" },
          generatedAt: { type: "string", example: "2026-05-28T14:10:00Z" },
          generatedById: { type: "string", example: "u-aime" }
        }
      },
      SystemParameter: {
        type: "object",
        properties: {
          id: { type: "string", example: "p5" },
          paramKey: { type: "string", example: "RETENTION_DAYS" },
          paramValue: { type: "string", example: "30", description: "Valeur active appliquée dans le moteur" },
          description: { type: "string", example: "Délai de rétention en jours des documents dans la corbeille" },
          paramType: { type: "string", example: "INTEGER", enum: ["STRING", "INTEGER", "BOOLEAN", "URL"] },
          isEditable: { type: "boolean", example: true }
        }
      }
    }
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentification"],
        summary: "S'authentifier sur le portail d'archives d'AFG Bank",
        description: "Vérifie l'adresse email professionnelle d'un collaborateur ou d'un gestionnaire RH de l'Annuaire Actif, ainsi que son code secret individuel, puis génère et retourne un jeton cryptographique JWT sécurisé de format Bearer servant à authentifier toutes les requêtes subséquentes.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  matricule: { type: "string", description: "Email professionnel enregistré ou Matricule complet sous format officiel", example: "aime.mbili@afgbank.ga" },
                  password: { type: "string", description: "Mot de passe d'habilitation LDAP/Interne ou de contournement", example: "Postgresql123" }
                },
                required: ["matricule", "password"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Session établie avec brio. Le jeton Bearer JWT est retourné pour l'injection dans les headers de sécurité.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "Bearer u-aime", description: "Jeton Bearer contenant l'identité signée" },
                        user: { $ref: "#/components/schemas/User" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Champs requis manquants ou invalides.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          },
          "401": {
            description: "Identifiants d'accès invalides ou compte d'agent suspendu par la sécurité centrale d'AFG.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentification"],
        summary: "Obtenir l'identité sécurisée de la session courante",
        description: "Décode le jeton d'authentification crypté `Bearer` passé en paramètre d'entête HTTP pour lister les attributs administratifs, le code agence et les droits applicables (RBAC) de l'utilisateur actif.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Données de l'utilisateur authentifié retournées avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "401": {
            description: "Jeton manquant, altéré ou expiré (Session déconnectée).",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/api/dashboard/stats": {
      get: {
        tags: ["Métriques & Tableaux de Bord"],
        summary: "Obtenir l'état consolidé des archives nationales d'AFG Bank",
        description: "Consolide les volumes totaux indexés, les effectifs d'agences du Gabon, le prorata d'occupation par type de document, l'état de la rétention temporaire, et affiche un résumé global à destination de l'audit de surveillance d'AFG Bank.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Statistiques consolidées avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        totalDocumentsCount: { type: "integer", example: 1248 },
                        totalEmployeesCount: { type: "integer", example: 320 },
                        totalAgenciesCount: { type: "integer", example: 4 },
                        totalTrashCount: { type: "integer", example: 8 },
                        retentionDays: { type: "integer", example: 30 },
                        docsByCategory: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              categoryId: { type: "string", example: "cat-contrats" },
                              categoryName: { type: "string", example: "Contrats" },
                              count: { type: "integer", example: 436 },
                              percentage: { type: "number", example: 35 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": { description: "Non authentifié.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/documents": {
      get: {
        tags: ["GED d'Archives"],
        summary: "Consulter et lister les archives de l'arborescence",
        description: "Retourne les fiches GED indexées de l'établissement, filtrables par mot-clé (nom original, matricule, collaborateur), identifiant de catégorie, et statut de suppression locale (Corbeille).",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, required: false, description: "Critère textuel ou matricule pour le filtrage par nom, poste, matricule" },
          { name: "category", in: "query", schema: { type: "string" }, required: false, description: "Identifiant précis de la catégorie de documents (ex: `cat-paie`)" },
          { name: "isDeleted", in: "query", schema: { type: "string", default: "false" }, required: false, description: "Passer `true` pour lister spécifiquement les documents archivés dans la Corbeille de rétention" }
        ],
        responses: {
          "200": {
            description: "Liste paginée ou dictionnaire consolidé des documents.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Document" }
                    }
                  }
                }
              }
            }
          },
          "401": { description: "Session expirée.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Habilitations insuffisantes pour scanner la GED nationale.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      },
      post: {
        tags: ["GED d'Archives"],
        summary: "Téléverser et indexer un nouveau document GED",
        description: "Permet d'insérer, sceller et calculer l'empreinte de sécurité physique d'une archive d'accréditation. Si le dossier d'archivage individuel de l'agent affecté n'existe pas en agence, il est pré-créé automatiquement.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  originalFileName: { type: "string", example: "Diplome_Master_Sophie.pdf", description: "Nom complet du fichier physique" },
                  documentTypeId: { type: "string", example: "dt-diplome", description: "Classification typologique" },
                  employeeId: { type: "string", example: "u-aime", description: "Identifiant du collaborateur ciblé (coffre personnel)" },
                  description: { type: "string", example: "Diplôme National de Master d'Administration", description: "Notes de description" },
                  fileContent: { type: "string", example: "data:application/pdf;base64,JVBERi0xLjQKJ...", description: "Données binaires encodées sous protocole Base64" }
                },
                required: ["originalFileName", "documentTypeId"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Document scellé cryptographiquement et archivé dans le coffre.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Document téléversé et indexé avec succès !" },
                    data: { $ref: "#/components/schemas/Document" }
                  }
                }
              }
            }
          },
          "400": { description: "Spécification de fichier manquante ou type de document corrompu.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Habilitation d'écriture non rattachée au rôle applicatif.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/documents/{id}": {
      delete: {
        tags: ["GED d'Archives"],
        summary: "Déplacer un document vers la Corbeille (Suppression logique)",
        description: "Exécute une suppression logique du document d'archivage en calculant sa date d'extinction immuable selon les règles de rétention d'AFG Bank (généralement 30 jours, auto-supprimé par la suite). Permet son maintien d'audit et sa restauration rapide en cas d'erreur de manipulation d'un agent.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Identifiant de l'index documentaire à suspendre" }
        ],
        responses: {
          "200": {
            description: "Document désindexé avec succès et placé dans la corbeille d'audit.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Document déplacé vers la Corbeille de rétention de 30 jours." }
                  }
                }
              }
            }
          },
          "404": {
            description: "Document cible introuvable.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/api/documents/{id}/restore": {
      post: {
        tags: ["GED d'Archives"],
        summary: "Restaurer un document logé en Corbeille",
        description: "Réhabilite instantanément l'archive logée en corbeille en effaçant les verrous de rétention et en publiant cette restauration dans le registre d'audit centralisé de la banque.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Identifiant du document à rétablir" }
        ],
        responses: {
          "200": {
            description: "Document restauré et ré-indexé dans le dictionnaire général.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Document restauré avec succès !" }
                  }
                }
              }
            }
          },
          "404": { description: "L'archive n'existe pas ou a déjà fait l'objet d'une purge physique pour dépassement de délai.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/documents/{id}/permanent": {
      delete: {
        tags: ["GED d'Archives"],
        summary: "Purge physique définitive d'une archive",
        description: "Éradication complète et définitive d'une archive de l'armoire de stockage et des index dictionnaire d'AFG Bank. Cette transaction de destruction physique requiert des accréditations exclusives (ex: DRH, Super Administrateur) et génère une trace d'alerte COBAC cryptée indélébile.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Identifiant du document à détruire définitivement" }
        ],
        responses: {
          "200": {
            description: "Document détruit définitivement et traces d'audit consolidées.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Document définitivement purgé du disque." }
                  }
                }
              }
            }
          },
          "403": { description: "Droits de purge insuffisants ou rôle applicatif inapproprié.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Le document demandé n'existe pas ou est déjà détruit.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/trash/empty": {
      delete: {
        tags: ["GED d'Archives"],
        summary: "Vider entièrement la Corbeille de rétention de l'établissement",
        description: "Purge d'un coup l'ensemble des documents logés temporairement dans la corbeille. Action irréversible réservée au comité de direction des archives.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Corbeille générale purgée avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "La corbeille a été vidée." }
                  }
                }
              }
            }
          },
          "403": { description: "Accès refusé aux agents de guichet.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/employees": {
      get: {
        tags: ["Annuaire des Collaborateurs"],
        summary: "Lister l'ensemble des collaborateurs d'AFG Bank Gabon",
        description: "Interroge l'Annuaire Actif pour ramener la liste complète des fiches collaborateurs du réseau national AFG GABON.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Registre récupéré.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Annuaire des Collaborateurs"],
        summary: "Enregistrer une nouvelle fiche collaborateur",
        description: "Crée et habilite une nouvelle fiche d'agent dans l'Annuaire Actif, lui alloue un matricule, pré-génère sa boîte de coffre-fort et définit ses rôles de sécurité RH.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  matricule: { type: "string", example: "EMP015", description: "Matricule unique attribuable" },
                  firstName: { type: "string", example: "Karl" },
                  lastName: { type: "string", example: "Ella" },
                  email: { type: "string", example: "karl.ella@afgbank.ga" },
                  phone: { type: "string", example: "+241 66 12 34 56" },
                  birthDate: { type: "string", example: "1992-12-04" },
                  hireDate: { type: "string", example: "2024-05-01" },
                  department: { type: "string", example: "Crédit & Risques" },
                  position: { type: "string", example: "Chef de Cabinet DGA" },
                  agencyId: { type: "string", example: "ag-siege" },
                  roleId: { type: "string", example: "role-employee", description: "Identifiant du rôle de sécurité (RBAC)" },
                  status: { type: "string", example: "ACTIVE", enum: ["ACTIVE", "SUSPENDED"] }
                },
                required: ["matricule", "firstName", "lastName", "email"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Collaborateur inscrit et coffre personnel initialisé.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Collaborateur ajouté avec succès !" },
                    data: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "400": { description: "Un agent possède déjà ce matricule unique au sein du réseau AFG GABON.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/roles": {
      get: {
        tags: ["Rôles & Habilitations (RBAC)"],
        summary: "Obtenir l'ensemble des rôles de sécurité applicatifs (RBAC)",
        description: "Fournit l'inventaire des profils de habilitation enregistrés auprès d'AFG Bank Gabon ainsi que la liste dictionnaire de leurs privilèges associés.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Liste des profils d'accès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Role" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/roles/{id}": {
      put: {
        tags: ["Rôles & Habilitations (RBAC)"],
        summary: "Mettre à jour les privilèges d'autorisation d'un rôle",
        description: "Redéfinit la liste dictionnaire des codes d'habilitation (par exemple : EMPLOYEE_CREATE, DOCUMENT_READ, etc.) rattachés au rôle sélectionné.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Identifiant du profil rôle à restructurer" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  permissions: {
                    type: "array",
                    items: { type: "string" },
                    example: ["USER_READ", "DOCUMENT_READ", "DOCUMENT_CREATE"]
                  }
                },
                required: ["permissions"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Permissions du profil actualisées et auditées en continu.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Permissions du rôle mises à jour avec succès !" },
                    data: { $ref: "#/components/schemas/Role" }
                  }
                }
              }
            }
          },
          "404": { description: "Profil de Rôle ciblé non trouvé.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/categories": {
      get: {
        tags: ["Catégories & Métadonnées"],
        summary: "Obtenir les catégories générales d'archivage",
        description: "Liste des dômes documentaires thématiques (Fiches de paie, Contrats, CNSS, Diplômes, etc.) actifs au niveau de la GED centrale.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Catégories retournées.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "cat-contrats" },
                          name: { type: "string", example: "Contrats" },
                          description: { type: "string", example: "Contrats de travail, avenants, engagements" },
                          isActive: { type: "boolean", example: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/document-types": {
      get: {
        tags: ["Catégories & Métadonnées"],
        summary: "Lister les types de documents actifs de l'arborescence",
        description: "Fournit la granularité typologique des documents d'archivage existants reliés à chaque sous-catégorie réglementaire.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Types de sous-pièces GED configurés.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "dt-contrat" },
                          name: { type: "string", example: "Contrat de travail" },
                          categoryId: { type: "string", example: "cat-contrats" },
                          description: { type: "string", example: "Contrats de travail signés par l'employé" },
                          isActive: { type: "boolean", example: true },
                          iconColor: { type: "string", example: "blue-500" },
                          iconType: { type: "string", example: "FileText" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Catégories & Métadonnées"],
        summary: "Créer un nouveau sous-type de document GED",
        description: "Ajoute une typologie de pièce comptable ou d'attestation au catalogue dynamique pour enrichir l'indexation future.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Certificat de Scolarité", description: "Intitulé du type" },
                  categoryId: { type: "string", example: "cat-divers", description: "Catégorie d'affiliation" },
                  description: { type: "string", example: "Pièce justificative scolaire pour enfants d'agents" }
                },
                required: ["name", "categoryId"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Type de document GED étendu.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Type de document ajouté avec succès !" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "dt-171241" },
                        name: { type: "string", example: "Certificat de Scolarité" },
                        categoryId: { type: "string", example: "cat-divers" },
                        description: { type: "string", example: "Pièce justificative scolaire pour enfants d'agents" },
                        isActive: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/access-requests": {
      get: {
        tags: ["Habilitations d'Accès Temporaires"],
        summary: "Consulter l'ensemble des demandes d'accès d'urgence",
        description: "Fournit au DRH et aux Auditeurs le registre complet de dérogations d'accès pour les dossiers à caractère hautement confidentiel ou rattachés à d'autres branches d'agence.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Suivi des autorisations d'urgence récupéré.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AccessRequest" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Habilitations d'Accès Temporaires"],
        summary: "Soumettre une demande d'accès ponctuelle d'un document confidentiel",
        description: "Crée un ticket d'habilitation temporaire nécessitant la validation exécutive du DRH suite à un motif d'intervention professionnelle dument justifié.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  documentId: { type: "string", example: "doc-1", description: "Document confidentiel désiré" },
                  reason: { type: "string", example: "Contre-expertise pour dossier d'Audit Interne COBAC.", description: "Justification de la consultation d'urgence" }
                },
                required: ["documentId", "reason"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Demande insérée en attente d'évaluation managériale.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Votre demande d'accès a été soumise au DRH !" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/access-requests/{id}": {
      put: {
        tags: ["Habilitations d'Accès Temporaires"],
        summary: "Approuver ou Refuser une demande de dérogation",
        description: "Permet aux arbitres (Direction DRH / Super Administrateurs) de statuer sur une demande, d'ouvrir l'accréditation temporaire ou de formuler un commentaire de rejet.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Identifiant de la demande d'accès" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "APPROVED", enum: ["APPROVED", "REJECTED"], description: "Décision définitive d'arbitrage" },
                  approverComment: { type: "string", example: "Autorisation validée pour examen COBAC de 48 heures.", description: "Commentaire d'instruction" }
                },
                required: ["status"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Statut de dérogation modifié et propagé au moteur d'habilitation.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "La demande a été APPROVED avec succès !" }
                  }
                }
              }
            }
          },
          "404": { description: "Le ticket d'accès n'existe pas.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/activity-logs": {
      get: {
        tags: ["Journal d’Audit d’Intégrité (COBAC)"],
        summary: "Consulter le registre d'audit centralisé complet",
        description: "Fournit au Comité d'Audit, à la DRC de la banque, de même qu'au régulateur national, un relevé chronologique infalsifiable des sessions de connexion, téléversements de documents, consultations GED, générations de cartes professionnelles ou purges physiques.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Registre historique retourné avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AuditLog" }
                    }
                  }
                }
              }
            }
          },
          "403": { description: "Grade de sécurité insuffisant pour visualiser le registre des logs d'audit.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/professional-cards": {
      get: {
        tags: ["Badges & Identité Professionnelle"],
        summary: "Lister toutes les cartes et badges d'agences émis",
        description: "Fournit la liste des badges professionnels d'agences numériques intégrant le QR Code unique de certification physique.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Inventaire des badges retourné.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProfessionalCard" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/professional-cards/generate/{employeeId}": {
      post: {
        tags: ["Badges & Identité Professionnelle"],
        summary: "Générer la Carte Professionnelle numérique d'un agent",
        description: "Calcule les codes barres de sécurité, inscrit la date d'émission et la validité à 2 ans du collaborateur, génère le QR code sécurisé pointant vers les serveurs de vérification de conformité d'AFG Bank Gabon.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "employeeId", in: "path", required: true, schema: { type: "string" }, description: "ID du collaborateur pour lequel éditer le laissez-passer" }
        ],
        responses: {
          "200": {
            description: "Calcul de clé de chiffrement et délivrance du badge achevée.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Carte Professionnelle numérique générée avec succès !" },
                    data: { $ref: "#/components/schemas/ProfessionalCard" }
                  }
                }
              }
            }
          },
          "404": { description: "Collaborateur introuvable au sein de la banque.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/system-parameters": {
      get: {
        tags: ["Configuration Système"],
        summary: "Obtenir l'état des verrous et paramètres applicatifs",
        description: "Fournit les valeurs dictionnaire système régissant la taille utile des fichiers téléversables, le fuseau horaire, le logo officiel et le quota des jours de corbeille.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Paramètres de fonctionnement récupérés.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SystemParameter" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/system-parameters/{paramKey}": {
      put: {
        tags: ["Configuration Système"],
        summary: "Modifier la valeur d'un paramètre de contrôle global",
        description: "Ajuste une constante de fonctionnement du serveur de documents et consigne cet aménagement immédiatement dans le journal d'activité d'audit.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "paramKey", in: "path", required: true, schema: { type: "string" }, description: "Clé unique de paramétrage (Ex: RETENTION_DAYS)" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  paramValue: { type: "string", example: "45", description: "Nouvelle valeur consolidée" }
                },
                required: ["paramValue"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Paramètre modifié et appliqué au runtime.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Paramètre système sauvegardé !" },
                    data: { $ref: "#/components/schemas/SystemParameter" }
                  }
                }
              }
            }
          },
          "404": { description: "Clé de configuration système non existante ou non modifiable.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/chat/message": {
      post: {
        tags: ["Assistant Intelligent d'Audit - ARHI"],
        summary: "Adresser une commande ou question à l'assistance IA d'AFG Bank (ARHI)",
        description: "Interagit avec l'assistant souverain d'audit ARHI (propulsé par Gemini 3.5 Flash). Permet d'obtenir des extraits de la politique de rétention, d'analyser d'une pièce d'identité ou de comprendre une clause de convention collective nationale.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Quelle est la durée légale de conservation des bulletins de paie ?", description: "Consigne d'audit ou question" },
                  sessionId: { type: "string", example: "sess-default", description: "Identifiant optionnel pour relier l'historique de la discussion" }
                },
                required: ["message"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Réponse générée de manière fluide par l'IA.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        sessionId: { type: "string", example: "sess-default" },
                        message: { type: "string", example: "D'après les dispositions régulatrices de la COBAC et le Code du Travail gabonais..." },
                        history: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string", example: "m-17124112-ai" },
                              userId: { type: "string", example: "u-aime" },
                              role: { type: "string", example: "model", enum: ["user", "model"] },
                              message: { type: "string", example: "..." },
                              sentAt: { type: "string", example: "2026-05-28T22:12:10Z" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/chat/history": {
      get: {
        tags: ["Assistant Intelligent d'Audit - ARHI"],
        summary: "Consulter l'historique de clavardage de la session",
        description: "Récupère les échanges mémorisés avec l'agent d'assistance ARHI afin d'animer l'interface utilisateur de manière rémanente.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "sessionId", in: "query", schema: { type: "string" }, required: false, description: "Identifiant de la discussion" }
        ],
        responses: {
          "200": {
            description: "Historique de discussion chargé.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "m-1234-usr" },
                          userId: { type: "string", example: "u-aime" },
                          role: { type: "string", example: "user" },
                          message: { type: "string", example: "Bonjour ARHI" },
                          sentAt: { type: "string", example: "2026-05-28T22:12:10Z" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
