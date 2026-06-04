# 🏛️ MANUEL DE FORMATION SYSTEME CENTRAL
## CONFORMITE COBAC R-202X, REGULATION SECURITAIRE ET PRATIQUES GED — AFG BANK GABON S.A.

---

### À PROPOS DE CE MANUEL
Ce document est un support pédagogique de référence destiné aux formateurs de la Direction des Ressources Humaines, de l'Audit Interne et de la Sécurité d'**AFG Bank Gabon**. 
Il explique en détail le fonctionnement et les obligations réglementaires entourant le **Système Central d’Archives & d’Accréditations RH**.

---

## 📅 CHAPITRE 1 : LE CADRE REGLEMENTAIRE ET LES EXIGENCES COBAC

La **COBAC** (*Commission Bancaire de l'Afrique Centrale*) réglemente l'organisation sécuritaire des institutions de crédit dans l'espace CEMAC. Le recrutement, les fiches financières de paie et la détention de cartes professionnelles pour le personnel d'AFG Bank Gabon doivent obéir à des règles strictes de traçabilité.

### 1.1 Directives COBAC sur la Sauvegarde Documentaire
* **Intégrité obligatoire** : Aucun document de carriere (contrat de travail initial, avenant salarial, attestation de présence) ne peut être introduit ou modifié sur le système d'archives sans le calcul instantané d'une empreinte cryptographique. C'est l'assurance pour l'organisme de régulation qu'aucun document n'a subi d'altération intentionnelle (antidatage ou réécriture de clauses salariales).
* **Double signature** : Tout document de paie ou contrat doit être rattaché de manière non-répudiable au **Gestionnaire** l'ayant importé, et au **Directeur** l'ayant validé.
* **Conservation à vie** : Certains documents (diplômes officiels de recrutement, soldes de tout compte d'anciens agents) doivent être archivés pendant une durée minimale de 10 ans.

### 1.2 RGPD et Protection des Données à Caractère Personnel
Bien que l'audit réglementaire exige la centralisation, la loi gabonaise relative à la protection des données nominatives impose que les données RH confidentielles (ex : bulletins de salaire, pièces médicales) soient invisibles pour tout tiers non habilité expressément.
* Le système applique l'isolation de branche locale et la ségrégation par agence d'affiliation.

---

## 🔒 CHAPITRE 2 : ARBRE D'HABILITATION ET MATRICE RBAC

Notre système d'AFG Bank repose sur un modèle d'accès de classe entreprise : le **Contrôle d’Accès Basé sur les Rôles (RBAC)**.
Ci-dessous la matrice logique configurée dans notre annuaire d'authentification centralisé :

| Rôle Applicatif | Niveau de Confidentialité | Droits Clés | Périmètre de Ségrégation |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | ★★★★★ (Niveau 5) | Toutes les permissions (`*`), audit total, exécution de la purge à zéro. | National (Multi-Agences) |
| **DRH (Directeur)** | ★★★★★ (Niveau 5) | `EMPLOYEE_WRITE`, `DOCUMENT_WRITE`, `CARD_GENERATE`, `ACCESS_REQUEST_APPROVE`, `AUDIT_READ`. | National (Multi-Agences) |
| **RH_MANAGER** | ★★★★☆ (Niveau 4) | `DOCUMENT_CREATE`, `EMPLOYEE_READ`, `CARD_GENERATE`, `ACCESS_REQUEST_CREATE`. | Agence d'affectation locale |
| **AUDITOR** | ★★★★☆ (Niveau 4) | `EMPLOYEE_READ` (uniquement), `DOCUMENT_READ`, `AUDIT_LOG_READ`. | National (Bouton VOIR TOUT actif) |
| **AGENT_ADMIN**| ★★★☆☆ (Niveau 3) | `DOCUMENT_CREATE` (Indexation et versage d'archives), `DOCUMENT_READ`. | Agence d'affectation locale |
| **EMPLOYEE** | ★★☆☆☆ (Niveau 2) | Consulter son propre dossier d'archives, discuter avec l'IA ARHI. | Personnel-Unique |
| **RETIRED** | ★☆☆☆☆ (Niveau 1) | Accès restreint en lecture de fin de carrière, pas de modification. | Personnel-Unique |
| **COMPTABLE** | ★★★★☆ (Niveau 4) | `FINANCE_READ`, `FINANCE_CREATE`, calcul des taxes d'AFG Bank. | National (Finances uniquement) |
| **CLIENT** | ★☆☆☆☆ (Niveau 1) | Accès en lecture seule à ses propres fiches de financement autorisées. | Externe |

---

## 🔑 CHAPITRE 3 : LES SECRETS DE L'EMPREINTE CRYPTOGRAPHIQUE SHA-256

Lorsqu'un document arrive sur notre GED centrale :
1. **Extraction de flux binaire** : Le serveur analyse le fichier à la recherche de sa structure binaire globale.
2. **Hachage Cryptographique** : L'algorithme mathématique **SHA-256** (*Secure Hash Algorithm*) calcule une chaîne unique de 64 caractères hexadécimaux immuables.
   * *Exemple d'une empreinte* : `f30da57f6b89c016e372e391bfa3c61d...`
3. **Déduplication préventive** : Si un gestionnaire tente d'importer par erreur deux fois le même fichier sous deux noms distincts, le système d'AFG Bank détecte immédiatement l'identité exacte de l'empreinte et alerte la Sécurité des Systèmes d'un probable doublon d'armoires.

---

## 🎫 CHAPITRE 4 : GENERATEUR ET METHODOLOGIE D'EMISSION DES BADGES PROFESSIONNELS

La création d'un badge professionnel d'armoire ne relève pas de l'esthétique. C'est l'élément d'identification universel exigé par les inspecteurs en agence.

```
       ___________________________________________
      |  AFG BANK GABON S.A.                      |
      |  ===================                      |
      |   ______   N° BADGE: AFGBANK-2024-EMP001  |
      |  |      |                                 |
      |  | PHOTO|  TITULAIRE: Aimé Mbili          |
      |  |______|  POSTE: Directeur Sécurité / IT |
      |                                           |
      |   [ QR ]   AGENCE: Siège Libreville       |
      |   [CODE]   VALIDITE: 2024 -> 2026         |
      |___________________________________________|
```

### 4.1 Caractéristiques de Sécurité :
1. **Numérotation unique** : Composée sous la formule `AFGBANK-[ANNÉE]-MATRICULE`.
2. **Identification Agence** : Le logo officiel ainsi que le code territorial d'agence gabonaise y sont imprimés.
3. **Le QR Code d'Authenticité** : Ce code bar-bidimensionnel renvoie vers un lien d'URL d'audit cryptographique administré par AFG Bank : `/verify/card/[NUMBER]`. Tout agent de sécurité à l'entrée d'une armoire de banques peut flasher le code sur son terminal mobile pour vérifier l'exacte adéquation de l'habilitation.

---

## 🛡️ CHAPITRE 5 : WORKFLOW DE DEROGATION ADMINISTRATIVE ET DEMANDE D'ACCREDITATION

Lorsqu'un inspecteur, auditeur, ou gestionnaire d'un autre secteur demande à inspecter un document pour lequel son rôle ne possède pas intrinsèquement les privilèges, le système impose l'interception et le déclenchement du **Workflow de Dérogation** :

```
       [ 👤 Demandeur ] ---------> Crée une requête avec motif d'audit
                                              |
                                              v
                                  [ 💾 Journalisé en Log ]
                                              |
                                              v
       [ 🏢 DRH / Admin ] --------> Valide / Commentaire de dérogation
                                              |
                                              v
       [ ✅ Consultation ] --------> Visualisation débloquée temporairement
```

### 📋 Obligations Légales d'Enquêtes :
* Sans l'inscription explicite du **Motif de la demande** (ex: *"Audit externe des comptes annuels exigé par la direction de l'audit"*), le système refuse de soumettre la dérogation.
* L'approbateur (DRH/Super Admin) doit inscrire des **Notes de Décision** qui serviront de base légale lors des auditions réglementaires en fin d'exercice financier.

---

## 🗑️ CHAPITRE 6 : POLITIQUE DE RETENTION ET PURGE DES ARCHIVES

La suppression d'un élément d'armoire fiscale dans le secteur bancaire gabonais est temporaire.
* **Le Puits de Rétention (Corbeille)** : Tout document dont le tri exige l'élimination est placé dans un coffre d'isolement temporaire.
* **Le Délai National (30 Jours)** : Pendant 30 jours (délai éditable depuis la console des paramètres du dictionnaire d'archives), l'archive reste restaurable par un inspecteur d'AFG Bank. Un compte à rebours dégressif signale la date de purge automatique irréversible.
* **La non-répudiation** : L'acte de suppression d'archives insère l'identité de l'opérateur, l'IP source, et la date exacte au millième de seconde dans notre registre central des anomalies d'audit.

---

## 💬 CHAPITRE 7 : EXPLICATION DE L'IA CONSEILLERE "ARHI"

**ARHI** (*Archives RH Intelligent*) est notre moteur de traitement d'Intelligence Artificielle en langage naturel rattaché à l'armoire GED.
* **Interrogation des anomalies** : L'inspecteur peut interroger l'IA pour lister les écarts statistiques du système.
* **Aide à l'intégration** : L'IA aide les gestionnaires à comprendre comment classifier les avenants CNSS de Libreville et les fiches fiscales gabonaises.
* **Raccourcis de Recherche** : Saisir une demande comme *"Affiche-moi le dossier de Paul Samba"* active la recherche intelligente transversale et isole instantanément la fiche de l'agent.

---
*Ce manuel de formation fait partie de la documentation réglementaire d'AFG Bank Gabon S.A. Toute reproduction ou divulgation non autorisée en dehors du périmètre d'inspection de la COBAC est passible de sanctions administratives et judiciaires.*
