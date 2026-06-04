# CAHIER DES CHARGES SOCIAL ET TECHNIQUE HYPER-PREMIUM
## Système Intégré de Ressources Humaines, GED Réglementaire & Portail de Sécurisation d'Accréditations
### APPLICATION PHARE : AFG BANK GABON S.A.
**Propriété Exclusive d’Atlantique Financial Group (AFG) - Direction Générale Libreville**

---

## SOMMAIRE DÉTAILLÉ
1. [PRÉAMBULE & VISION STRATÉGIQUE](#1-préambule--vision-stratégique)
2. [CONFORMITÉ RÉGLEMENTAIRE ET GOUVERNANCE (COBAC, DGI GABON, RGPD)](#2-conformité-réglementaire-et-gouvernance-cobac-dgi-gabon-rgpd)
3. [SPECIFICATIONS FONCTIONNELLES & MATRICE ACCRÉDITATIONS (RBAC)](#3-specifications-fonctionnelles--matrice-accréditations-rbac)
4. [ÉTUDE ET SPÉCICATION DES CAS D'UTILISATION (USE CASES APPLICATIFS)](#4-étude-et-spécication-des-cas-dutilisation-use-cases-applicatifs)
5. [MODÉLISATION DE LA DONNÉE D'ENTREPRISE (MCD, MLD ET DICTIONNAIRE)](#5-modélisation-de-la-donnée-dentreprise-mcd-mld-et-dictionnaire)
6. [RÈGLES MÉTIERS ANALYTIQUES (PAIE, COTISATIONS, RÉTENTION ET CHRONO-CODES)](#6-règles-métiers-analytiques-paie-cotisations-rétention-et-chrono-codes)
7. [ARCHITECTURE LOGICIELLE ET MATRICE DES FLUX DE COMMUNICATION](#7-architecture-logicielle-et-matrice-des-flux-de-communication)
8. [SPECIFICATIONS TECHNIQUES DES INTERFACES APIS (CONSTRUCTEUR SWAGGER)](#8-specifications-techniques-des-interfaces-apis-constructeur-swagger)
9. [CHARTE ERGONOMIQUE, COMPORTEMENT FRONT-END ET DESIGN SYSTEM](#9-charte-ergonomique-comportement-front-end-et-design-system)
10. [PLAN D'EXAMEN DE CONFORMITÉ ET STRATÉGIE DE DÉPLOIEMENT](#10-plan-dexamen-de-conformité-et-stratégie-de-déploiement)

---

## 1. PRÉAMBULE & VISION STRATÉGIQUE

### 1.1 Contexte Général
Atlantique Financial Group (AFG) déploie son infrastructure bancaire au cœur de la Communauté Économique et Monétaire de l'Afrique Centrale (CEMAC). Au Gabon, **AFG Bank Gabon S.A.** s'inscrit dans une dynamique d'expansion rapide avec le déploiement de plusieurs agences stratégiques : le **Siège Social à Libreville**, l'agence maritime de **Port-Gentil**, l'agence industrielle de **Franceville**, et l'agence minière de **Moanda**.

L'accélération de ce réseau d'agences exige un alignement immédiat de la gestion des ressources humaines, du contrôle documentaire et de la sécurité des accès physiques aux locaux sensibles (guichets centraux, coffres bancaires, salles serveurs).

### 1.2 Problématique Métier
La décentralisation opérationnelle d'AFG Bank Gabon a mis en évidence plusieurs limitations critiques :
*   **Insécurité documentaire** : Dispersion des dossiers administratifs d'embauche, des diplômes, et des fiches de paie sur des partages réseau non audités ou des archives physiques vulnérables.
*   **Lenteur de l'Onboarding** : L'intégration d'un nouveau collaborateur nécessite plusieurs jours entre l'obtention du contrat papier, son catalogage et l'enregistrement dans l'annuaire d'agence.
*   **Opacité des Absences** : Absence de circuit décisionnel unifié pour l'arbitrage des congés payés et des permissions spéciales, nuisant à la planification opérationnelle des guichets.
*   **Risque Réglementaire COBAC** : Difficulté à présenter instantanément des données d'audit infalsifiables et des historiques complets de consultation de données personnelles de paie en cas d'inspection inopinée.

### 1.3 Vision Cible : La Plateforme Unifiée AFG-RH
La présente application web unifie au sein d'une interface sécurisée :
1.  **Une Gestion Électronique de Documents (GED) ultra-sécurisée** faisant office de coffre-fort numérique individuel pour chaque agent habilité.
2.  **Un Annuaire Administratif d’Établissement** assurant le suivi de carrières complet.
3.  **Un Moteur d’Accréditation Physique** pour l'édition et l'évaluation des cartes d'accès au siège, vérifiable par micro-scanners (via QR-Code cryptographique).
4.  **Un Module de Calcul de Paie COBAC/DGI** simulant avec exactitude les bulletins de paie gabonais avec déductions fiscales obligatoires.
5.  **Un Module Workflow Congés / Permissions** direct, synchrone et opposable.
6.  **Un Portail Carrières & Onboarding Automatisé** reliant les candidatures de recrutement publiques directement au vivier administratif actif de la banque.

---

## 2. CONFORMITÉ RÉGLEMENTAIRE ET GOUVERNANCE (COBAC, DGI GABON, RGPD)

L’application logicielle n'est pas un simple utilitaire de gestion d'entreprise, elle constitue un **système de contrôle interne critique** soumis aux prescriptions des autorités locales et internationales.

```
       +-------------------------------------------------------+
       |             DIRECTIVES BANCAIRES ET GATB              |
       |  Conformité COBAC, Fiscalité DGI, Habilitations RGPD  |
       +---------------------------+---------------------------+
                                   |
                                   v
             +---------------------+---------------------+
             |                                           |
             v                                           v
+------------------------+                  +------------------------+
|      RÈGLEMENTATION    |                  |      GOUVERNANCE       |
|    D’AUDIT INTERNE     |                  | DES DONNÉES SENSIVLES  |
| - Traçabilité 100%     |                  | - Chiffrement en transit|
| - Empreinte SHA-256    |                  | - Contrôle RBAC strict |
| - Journal d'incidents  |                  | - Purge de Rétention   |
+------------------------+                  +------------------------+
```

### 2.1 Cadre de Contrôle Interne COBAC (CEMAC)
Conformément au **Règlement COBAC R-2016/04** relatif au contrôle interne des établissements de crédit, la banque doit mettre en œuvre des systèmes d'information robustes garantissant :
*   **L’Intégrité des données financières et administratives** : Interdiction absolue de modifier des bulletins d'émoluments ou des contrats de travail sans laisser une trace indélébile. Une empreinte unique **SHA-256** doit être calculée lors du téléversement de toute pièce GED.
*   **La Traçabilité d'accès (Audit Trail)** : Chaque lecture de document confidentiel par un administrateur ou un responsable comptable doit alimenter un journal d'audit (`AuditLog`) non falsifiable répertoriant l’IP, l'identité de l'agent, l'heure et l'action.
*   **La Clôture Périodique Sécurisée** : L'accès dictionnaire doit être bloqué ou régulé par une dérogation d'accès temporaire approuvée par le Directeur Sécurité & Conformité (DSI) pour les documents classés "Restreints".

### 2.2 Cadre Juridique Gabonais de Protection des Données Personnelles
Sous le contrôle de la **CNPDCP** (Commission Nationale pour la Protection des Données à Caractère Personnel), l'outil implémente :
*   **Le principe de Minimisation** : Les informations récoltées se cantonnent aux stricts besoins d'onboarding financier et administratif de l'agent habilité.
*   **La Corbeille de Rétention Temporaire** : Un fichier supprimé par un gestionnaire n'est pas immédiatement effacé du stockage physique. Il migre vers une corbeille d'audit qui applique un délai d'extinction de **30 jours** (définissable dynamiquement par clé système). Durant cette période, la pièce n'est plus accessible par les agents de guichet ordinaires mais peut être restaurée par le Super Administrateur. Au-delà, une purge asynchrone éradique définitivement les octets de l'archive.

### 2.3 Cadre Fiscal de la Direction Générale des Impôts (DGI Gabon)
Les modélisations comptables de rémunération doivent intituler et déduire précisément les charges patronales et salariales du travail gabonais. Notre simulateur intégré se conforme à la loi numéro 028/2016 portant code de sécurité sociale et régissant la CNSS, ainsi qu'aux barèmes progressifs de l'IRPP de l'année en cours.

---

## 3. SPECIFICATIONS FONCTIONNELLES & MATRICE ACCRÉDITATIONS (RBAC)

Le système de contrôle d'accès est un dispositif de sécurité à rôles discriminants (Role-Based Access Control). L'ensemble des endpoints et écrans est intercepté par le module `<SecurityGate />` de l'interface et par des middlewares d'authentification sur le serveur Express.

### 3.1 Définition des Rôles Applicatifs
1.  **SUPER_ADMIN (Régulateur / Directeur SI)** : Privilèges absolus. Il accède à la console centrale globale, définit les paramètres sensibles de rétention, analyse l'intégralité du journal d’audit (`AuditLog`), réhabilite les archives supprimées par erreur et pilote l'ordonnancement multi-succursales.
2.  **ADMIN_AGENCE (Directeur d'Agence locale)** : Il gère les fiches collaborateurs et les dossiers documentaires affectés exclusivement à son code agence de rattachement (ex: uniquement Port-Gentil). Il ne peut ni lire les documents transverses du siège ni modifier les paramètres systèmes d'extinction d'archives.
3.  **COMPTABLE (Responsable Paie & Budgets)** : Il accède de manière exclusive à l'interface de modélisation de paie, ajoute et valide les primes nationales, exécute des simulations budgétaires d'agences, et verse les bulletins au format PDF nominatif.
4.  **ANAL_RH (Chargé des Carrières & du Recrutement)** : Il s'occupe de l'acquisition des talents, de la publication des annonces techniques, du suivi des notes d'admission, de l'onboarding et du traitement de l'arbitrage des congés de l'ensemble du réseau d'établissements.
5.  **USER (Collaborateur Standard / Agent de Banque)** : Accès centré sur son espace personnel. Il reçoit les alertes internes, modifie ses coordonnées de contact, soumet ses requêtes motivées de congés payés, et télécharge de façon autonome ses documents administratifs individuels validés.
6.  **CLIENT (Investisseur / Déposant de Garanties)** : Profil extérieur. Il dépose ses cautions financières pour validation administrative par le secrétariat de l'agence, et fixe des rendez-vous physiques à la succursale de son choix pour audit de dossiers de prêts commerciaux.

### 3.2 Matrice de Permissions Granulaire

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                                  MATRICE DE PRIVILÈGES RBAC                                             |
+-------------------+----------------------------+-----------------------+---------------------+--------------------------+
| Rôle              | Lecture Fiches Employés   | Écrit Documents GED   | Arbitrage Absences  | Audit & Système Central  |
+-------------------+----------------------------+-----------------------+---------------------+--------------------------+
| SUPER_ADMIN       | Tous                       | Tous (avec Purge CD)  | Tous                | Autorisé (100% de la GE) |
| ADMIN_AGENCE      | Propre Agence uniquement   | Propre Agence         | Consultation        | Interdit                 |
| COMPTABLE         | Tous (Lect. Administrative) | Bulletins de Paie     | Interdit            | Interdit                 |
| ANAL_RH           | Tous                       | Contrats / Diplômes   | Décisionnelle Totale| Interdit                 |
| USER              | Fiche Personnelle Uniq.    | Téléchargement Personnel| Formulaire Dépôt    | Interdit                 |
| CLIENT            | Aucun                      | Aucun                 | Aucun               | Interdit                 |
+-------------------+----------------------------+-----------------------+---------------------+--------------------------+
```

---

## 4. ÉTUDE ET SPÉCICATION DES CAS D'UTILISATION (USE CASES APPLICATIFS)

### 4.1 Diagramme Général des Rôles Métiers (Text-UML)

```
                            +----------------------------------------+
                            |            PORTAL AFG-RH BANK          |
                            |                                        |
      (Super Administrateur)|---( Visualiser Logs Audit Global )     |
                            |---( Configurer Rétention Corbeille )   |
                            |                                        |
      (Directeur d'Agence)  |---( Surveiller Effectifs de l'Agence ) |
                            |---( Sceller Profil Agent d'Agence )    |
                            |                                        |
      (Comptable / Finance) |---( Calculer Impôts IRPP & Cotisations)|
                            |---( Publier Reçus de Paie dans GED )   |
                            |                                        |
      (Analyste Recruteur)  |---( Publier Vacances d'Emplois )       |
                            |---( Onborder à la Volée les Reçus )     |
                            |---( Valider Bulletins d'Absences )     |
                            |                                        |
      (Collaborateur Agent) |---( Confectionner Demande de Congé )   |
                            |---( Imprimer Badge d'Accès Physique )  |
                            |                                        |
      (Client Externe)      |---( Verser Garantie & Cautionnement )  |
                            |---( Prendre Rendez-vous à l'Agence )   |
                            +----------------------------------------+
```

---

### 4.2 Analyse Détaillée des Scénarios de Navigation (User Journeys)

#### Scénario A : Le Recrutement Technique et Onboarding Instantané
*   **Acteurs principaux** : Analyste RH (Recruteur) et Candidat technique.
*   **Préconditions** : L'analyste RH est connecté et possède l'habilitation `EMPLOYEE_WRITE`. Une offre de poste a été diffusée sur le module public Carrières.
*   **Déroulement nominal (Le "Happy Path")** :
    1.  Le candidat technique formule sa candidature depuis le portail public en spécifiant son nom (*ex: Sophie Dougou*), son mail et l'adresse de son CV.
    2.  Le système stocke instantanément sa candidature avec le flag `APPLIED` et notifie la DRH.
    3.  L'analyste RH ouvre la console de Recrutement, explore la fiche de candidature et planifie un entretien physique pour le 04 Juin 2026.
    4.  À la suite de l'entretien, l'analyste attribue la note technique de **88/100** au test d'évaluation et rédige un avis de jury élogieux.
    5.  L'analyste RH presse le bouton critique d'action **"Onborder l'Agent — Embauche Validée"**.
    6.  Le moteur d'onboarding intercepte la commande :
        *   Il crée une fiche administrative définitive pour Sophie Dougou dans l'annuaire de Libreville.
        *   Il lui alloue automatiquement un matricule d'entreprise immuable : `AFG-2026-0045`.
        *   Il provisionne sa fiche d'agent active et son coffre-fort numérique de GED.
        *   Il injecte une notification de bienvenue sur son espace personnel de connexion d'agent.
        *   Il crée un badge d'accès professionnel physique doté d'une empreinte QR d'accréditation.
    7.  Le candidat est dorénavant membre actif de l'annuaire bancaire d'AFG Bank.

#### Scénario B : La Demande, l'Arbitrage de Congé et l'Impact sur la Paie
*   **Acteurs principaux** : Collaborateur Agent, Analyste RH (Validateur) et Responsable Comptable.
*   **Préconditions** : L'agent dispose d'un solde de congés valide et est authentifié.
*   **Déroulement nominal** :
    1.  L'agent (par exemple, *Karl Ella*) se rend sur son tableau de bord de collaborateur.
    2.  Il remplit une demande de vacance annuelle de deux semaines pour les congés de Juillet. Il rédige le motif : "Repos annuel réglementaire d'exercice de cabinet inter-agences". Il soumet le formulaire.
    3.  L'API enregistre la demande sous l'état temporaire `PENDING` rattachée au matricule de Karl.
    4.  À Libreville, l'Analyste RH reçoit une alerte interactive sur son écran principal de contrôle de congés.
    5.  L'analyste clique sur "Évaluer la demande", prend connaissance du motif, saisit un commentaire d'accompagnement : "Approuvé par rapport aux quotas opérationnels de l'agence", et valide l'arbitrage.
    6.  D'une part, une notification push est instantanément projetée dans l'espace personnel de l'agent l'informant que son congé est répertorié.
    7.  D'autre part, le système met à jour son registre d'absences. Lors du prochain calcul financier par le comptable, la fiche de calcul du salaire de Karl Ella intégrera automatiquement l'abattement fiscal et indemnitaire lié à ce congé d'absence enregistré en dictionnaire.

#### Scénario C : Le Audit COBAC en Cas de Suppression Documentaire Accidentelle
*   **Acteurs principaux** : Directeur de Succursale, Super Administrateur et Inspecteur Central de la COBAC.
*   **Préconditions** : Un document de paie confidentiel a été malencontreusement détruit par un employé d'agence.
*   **Déroulement du protocole de conformité** :
    1.  L'employé d'agence initie un retrait ("Supprimer") sur un fichier de bulletin d'accident de travail.
    2.  Notre serveur calcule immédiatement la date d'expiration de l'archive (Date de versement + 30 jours de rétention définis dans les paramètres) et bascule son état en `isDeleted = true`.
    3.  L'action est instantanément transcrite dans la table `AuditLog` : `"Action: DELETE, Resource: Document, Target: bulletin_accident_v1.pdf, User: u-agent, Timestamp: 2026-05-30T14:00:00Z"`.
    4.  L'inspecteur de la COBAC arrive au siège social pour un contrôle de régulation et exige d'analyser la traçabilité des pièces d'archives de l'agence.
    5.  Le Super Administrateur se connecte sur son interface de haut niveau. Il accède au module du Journal Général d’Audit. Il présente à l'inspecteur le tableau détaillé contenant la liste exacte IP/Actions/Utilisateurs.
    6.  Grâce à la corbeille de rétention temporaire, le Super Administrateur localise le document sous le pavé "Archives en Rétention". Il presse le bouton **"Restaurer"**. Le document réintègre instantanément l'index primaire d'agence avec une ligne d'audit d'arbitrage de secours rédigée par le DSI. La banque est en pleine conformité.

---

## 5. MODÉLISATION DE LA DONNÉE D'ENTREPRISE (MCD, MLD ET DICTIONNAIRE)

### 5.1 Modèle Conceptuel de Données (MCD)

Le modèle conceptuel de données de notre registre centralisateur est modélisé selon l'approche Entité-Association (Schéma long et atomique) :

```
       +-------------------+                          +-------------------+
       |     ROLE (RBAC)   |1                         |      AGENCY       |1
       +-------------------+                          +-------------------+
       | - id (PK)         |                          | - id (PK)         |
       | - name            |                          | - name            |
       | - description     |                          | - city            |
       | - permissions     |                          | - code            |
       +---------+---------+                          +---------+---------+
                 | 1..*                                         | 1..*
                 |                                              |
                 v posséder                                     v résider
         +-------+----------------------------------------------+-------+
         |                        USER (AGENT)                          |
         +--------------------------------------------------------------+
         | - id (PK)                 - department                       |
         | - matricule (Unique)      - position                         |
         | - email (Unique)          - agencyId (FK)                    |
         | - firstName               - roleId (FK)                      |
         | - lastName                - status (ACTIVE/SUSPENDED)        |
         | - phone                   - birthDate                        |
         | - hireDate                - fullName (Calculé / Indexé)      |
         +---+--------------------+------------------------+------------+
             | 1                  | 1                      | 1
             |                    |                        |
             | 1..*               | 1..*                   | 1..*
             v indexer            v formuler               v posséder
       +-----+-------------+  +---+------------+     +-----+---------------+
       |     DOCUMENT      |  | LEAVE_REQUEST  |     | PROFESSIONAL_CARD   |
       +-------------------+  +----------------+     +---------------------+
       | - id (PK)         |  | - id (PK)      |     | - id (PK)           |
       | - originalFileName|  | - type         |     | - employeeId (FK)   |
       | - documentTypeId  |  | - startDate    |     | - employeeName      |
       | - employeeId (FK)  |  | - endDate      |     | - employeeMatricule |
       | - fileSize        |  | - status       |     | - cardNumber (Uniq) |
       | - sha256 (Hash)   |  | - reason       |     | - issueDate         |
       | - uploadedById(FK)|  | - approvedBy   |     | - expiryDate        |
       | - version         |  | - approvedAt   |     | - qrCodeUrl         |
       | - description     |  | - aprComment   |     | - status            |
       | - isDeleted       |  +----------------+     +---------------------+
       | - uploadDate      |
       | - retentionDate   |
       | - fileContent     |
       +-------------------+
```

---

### 5.2 Modèle Logique de Données (MLD / Schémas SQL)

#### table `users` (Collaborateurs & Habilités)
```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    birth_date DATE,
    hire_date DATE,
    department VARCHAR(100),
    position VARCHAR(150),
    agency_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RETIRED')),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (agency_id) REFERENCES agencies(id)
);
```

#### table `documents` (Coffre-fort GED)
```sql
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    original_file_name VARCHAR(255) NOT NULL,
    document_type_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50),
    file_size VARCHAR(25),
    sha256 CHAR(64) UNIQUE NOT NULL,
    uploaded_by_id VARCHAR(50) NOT NULL,
    version INT DEFAULT 1,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retention_date TIMESTAMP NULL,
    file_content MEDIUMTEXT, -- Contenu stocké sous Base64
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
);
```

#### table `access_requests` (Dérogations d'Accès Sécurisés)
```sql
CREATE TABLE access_requests (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    requester_id VARCHAR(50) NOT NULL,
    requester_name VARCHAR(200) NOT NULL,
    requester_position VARCHAR(150),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reason TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by_id VARCHAR(50),
    approved_at TIMESTAMP NULL,
    approver_comment TEXT,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (approved_by_id) REFERENCES users(id)
);
```

---

### 5.3 Dictionnaire Analytique des Champs (Data Dictionary)

| Nom Technique Champ | Type Primitif | Longueur | Contraintes | Rôle Fonctionnel métier |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR | 50 | PK, UUID / Interne | Clé primaire universelle unique de génération |
| `matricule` | VARCHAR | 50 | Unique, Indexé | Matricule formaté (ex: `AFG-0524` ou `AFG-2026-0034`) |
| `email` | VARCHAR | 150 | Unique, RFC 5322 | Adresse de messagerie officielle gabonaise de l'agent |
| `firstName` | VARCHAR | 100 | Non Nul | Prénom usuel officiel de l'collaborateur |
| `lastName` | VARCHAR | 100 | Non Nul | Nom de famille d'état civil complet |
| `sha256` | CHAR | 64 | Unique, Strict hex | Empreinte d’intégrité calculée lors du téléversement du fichier |
| `fileContent` | MEDIUMTEXT | - | Base64 structurel | Flux binaire encodé pour stockage direct local dans le conteneur |
| `isDeleted` | BOOLEAN | 1 | False par défaut | Flag déterminant le ciblage de corbeille d’extinction temporaire |
| `testScore` | INTEGER | - | Entre 0 et 100 | Note d'évaluation technique obtenue au cours d'onboarding |

---

## 6. RÈGLES MÉTIERS ANALYTIQUES (PAIE, COTISATIONS, RÉTENTION ET CHRONO-CODES)

### 6.1 Moteur Financier : Calcul de la Paie Gabonaise (Directive Fiscalité DGI)
Le module comptable opère selon un moteur analytique de déduction progressive cascade. Voici l'équation modélisée dans l'application pour un salaire de base brut de l'agent :

$$\text{Brut Netposable} = \text{Salaire de Base} + \text{Sursalaire} + \text{Primes Habituelle}$$

#### A. Cotisation CNSS (Sécurité Sociale)
*   **Taux salarial** : **4.2%** applicable sur le brut global taxable de l'agent.
*   **Plafond mensuel d'assiette** : **1,500,000 FCFA** (au-delà, la retenue plafonne à $1,500,000 \times 4.2\% = 63,000$ FCFA).

$$\text{Retenue CNSS} = \min(\text{Brut Netposable}, 1500000) \times 0.042$$

#### B. Cotisation CNAMGS (Assurance Maladie Universelle)
*   **Taux salarial** : **2.0%** applicable sur le brut taxable, sans notion de plafond d'assiette mensuelle.

$$\text{Retenue CNAMGS} = \text{Brut Netposable} \times 0.02$$

#### C. Impôt sur le Revenu des Personnes Physiques (IRPP)
*   Modélisé selon des paliers d'imposition progressifs calqués sur les directives de la DGI Gabon :
    *   Tranche de 0 à 1,500,000 FCFA annuel : **0%**
    *   Tranche de 1,500,001 à 3,000,000 FCFA annuel : **10%**
    *   Tranche de 3,000,001 à 6,000,000 FCFA annuel : **20%**
    *   Au-delà de 6,000,000 FCFA annuel : **35%**
*   L'IRPP calculé mensuellement est déduit directement à la source.

#### D. Salaire net d'exercice versé au collaborateur
$$\text{Salaire Net Payé} = \text{Brut Netposable} - \text{Retenue CNSS} - \text{Retenue CNAMGS} - \text{IRPP Déduit}$$

---

### 6.2 Règle d'Extinction Temporaire (Rétention COBAC)
*   Lorsqu’un document est taggué à "Supprimé" (`isDeleted = true`) :
    1.  La date système immédiate est notée en témoin.
    2.  La date limite de purge (`retentionDate`) est calculée en additionnant le paramètre `RETENTION_DAYS` extrait de la table des variables (par défaut **30 jours**).
    3.  Durant cette période d'incubation, le document n'apparaît plus dans l'arborescence standard de l'agence.
    4.  À l'échéance de la date de rétention (`retentionDate < DATE_NOW`), toute requête d'actualisation de la page orchestre l'effacement définitif et irréversible des métadonnées et du contenu Base64 de la base.

---

### 6.3 Procédure de Génération d'Accréditations Physiques (Passes Banques)
Pour assurer le couplage de la sécurité physique et informatique, chaque agent bénéficie d'une carte professionnelle générable en format imprimable :
*   **Règle de Numérotation** : `AFGBANK-<ANNEE_EMBAUCHE>-<MATRICULE_AGENT>`.
*   **Sceau d'Authenticité QR-Code** : Le QR-Code figurant sur le badge répertorie l'URL d'authentification absolue `/verify/card/<NUMERO_CARDE>` signé de manière logicielle. Le scanner de sécurité du portique de Libreville décode cette URL, interroge l'API de conformité de la banque et valide si l'état de la carte est bien `ACTIVE`. Si l'agent est suspendu administrativement (`SUSPENDED`), la carte passe instantanément au statut `REVOKED`, refusant le déverrouillage physique des barrières de la banque.

---

## 7. ARCHITECTURE LOGICIELLE ET MATRICE DES FLUX DE COMMUNICATION

L'application AFG Bank Gabon observe un profil architectural unifié **Full-Stack**. Afin de simplifier les procédures de déploiement conteneurisé (type Cloud Run ou Heroku), le serveur Node.js fait office de serveur d'API et de serveur d'actifs statiques compilés pour l'interface client-SPA.

```
          +--------------------------------------------------------+
          |                       APP COMPILÉ                      |
          |       Index.html + Assets React (Client SPA)            |
          +---------------------------+----------------------------+
                                      |
                                      v Servis par Express en PROD
+------------------------------------------------------------------+
|                          SERVEUR EXPRESS                         |
|  - API routes : /api/auth, /api/documents, /api/employees       |
|  - Middleware Vite : En développement uniquement (HMR désactivé)  |
|  - Moteur ESBuild : Compilation en dist/server.cjs pour PROD     |
+------------------------------------------------------------------+
```

### 7.1 Réduction des Import ES Modules (Problématique Runtime)
Afin d'éviter les erreurs d'exécution Node.js relatives aux extensions de fichiers des modules ES (`import { x } from './utils.js'`), le script de construction package l'intégralité du code serveur en un seul flux compilé dans `dist/server.cjs` à l’aide du compilateur de haute-sécurité `esbuild`. Ce format utilise CommonJS et inclut toutes les relations, garantissant un démarrage instantané et robuste de l'image de conteneur.

### 7.2 Configuration du Port de Communication unique
*   L’intégralité des transactions s’effectue impérativement sur le **port 3000** configuré en dur au niveau de la couche réseau d'ingress.
*   En cours de développement, le middleware d'actifs de Vite est monté dynamiquement sur l'instance d'Express, assurant un pont asynchrone transparent vers les composants React.

---

## 8. SPECIFICATIONS TECHNIQUES DES INTERFACES APIS (CONSTRUCTEUR SWAGGER)

Les points de contact API sont structurés sous format OpenAPI v3. Chaque requête exige le passage du Jeton d'accès Bearer JWT rattaché à l’identité de l'intervenant pour examen de conformité.

### 8.1 Module d'Accès de Sécurité

#### `POST /api/auth/login`
Authentification centralisée de l'agent d'AFG Bank.
*   **Payload (JSON)** :
    ```json
    {
      "matricule": "aime.mbili@afgbank.ga",
      "password": "MotDePasseLDAP"
    }
    ```
*   **Réponse de Succès (200 OK)** :
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "Bearer u-aime",
        "user": {
          "id": "u-aime",
          "matricule": "AFG-0524",
          "fullName": "Aimé Mbili",
          "roleId": "role-super-admin",
          "agencyId": "ag-siege"
        }
      }
    }
    ```
*   **Réponse de Rejet (401 Unauthorized)** :
    ```json
    {
      "success": false,
      "message": "Identifiants invalides ou compte d'agent temporairement suspendu."
    }
    ```

---

### 8.2 Module de GED & Archives

#### `GET /api/documents`
Consultation de l'arborescence GED. Filtrable selon la conformité d'agence.
*   **Query Parameters** :
    *   `search` (facultatif) : chaîne textuelle d'un matricule ou nom de fichier d’origine.
    *   `category` (facultatif) : identifiant de classification (`cat-paie`, `cat-contrats`).
    *   `isDeleted` (facultatif, défaut `false`) : si `true`, bascule sur la corbeille de rétention.
*   **Réponse (200 OK)** :
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "doc-345",
          "originalFileName": "Contrat_CDI_Sophie.pdf",
          "documentTypeId": "dt-contrat",
          "fileSize": "1.8 MB",
          "sha256": "8f3a39e8cce987bcda1248...",
          "uploadedById": "u-drh-aime",
          "isDeleted": false,
          "uploadDate": "2026-05-29T11:20:00Z"
        }
      ]
    }
    ```

#### `POST /api/documents`
Dépôt et indexation d'une archive numérisée sous scellé cryptographique.
*   **Payload (JSON)** :
    ```json
    {
      "originalFileName": "Avenant_Securite_Cabinet.pdf",
      "documentTypeId": "dt-contrat",
      "employeeId": "u-aime",
      "description": "Validation du protocole de conformité",
      "fileContent": "data:application/pdf;base64,JVBERi..."
    }
    ```
*   **Réponse (200 OK)** :
    ```json
    {
      "success": true,
      "message": "Document téléversé et indexé avec succès !",
      "data": {
        "id": "doc-a78b",
        "originalFileName": "Avenant_Securite_Cabinet.pdf",
        "sha256": "df7a88bc734ae8fa910243be...",
        "version": 1
      }
    }
    ```

---

### 8.3 Module Workflow Congés / Permissions

#### `POST /api/leave-requests`
Création formelle d'une demande d'absence réglementée.
*   **Payload (JSON)** :
    ```json
    {
      "type": "CONGE_ANNUEL",
      "startDate": "2026-07-01",
      "endDate": "2026-07-15",
      "reason": "Congés annuels de repos de l'inter-succursales"
    }
    ```
*   **Réponse (200 OK)** :
    ```json
    {
      "success": true,
      "message": "Demande de congé enregistrée avec statut temporaire PENDING.",
      "data": {
        "id": "lv-9034",
        "employeeName": "Karl Ella",
        "status": "PENDING"
      }
    }
    ```

---

## 9. CHARTE ERGONOMIQUE, COMPORTEMENT FRONT-END ET DESIGN SYSTEM

Notre cadre de présentation s'écarte des thématiques logicielles d'ingénierie brute (frais de logs, telemetry, codes d'agences exposés dans le vide). Il épouse les codes esthétiques haut-de-gamme de la finance digitale privée : une **interface haute fidélité, épurée et dense**.

```
+-------------------------------------------------------------------------+
|                               AFG BANK UI                               |
|   [Annuaire]  [Coffre GED]  [Finances & Paie]  [Carrières & Onboard]    |
+-------------------------------------------------------------------------+
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                  BENTO-GRID DES STATISTIQUES                    |   |
|   |   [Effectifs Actifs]  [GED validés]  [Postes Ouverts] [Masse $] |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|   +───────────────────────────────────+  +──────────────────────────+   |
|   │         FLUX DOCUMENTAIRE         │  │    CENTRE D'ACTIVITÉS    │   |
|   │       Recherche par mot-clé       │  │ (Audit, Impression badges│   |
|   │ [ CDI_Karl.pdf  - Type: Contrats ]│  │  génération QR-Codes d'  │   |
|   │ [ Paie_Mai.pdf  - Type: Finance  ]│  │  accès sécurisés)        │   |
|   +───────────────────────────────────+  +──────────────────────────+   |
|                                                                         |
+-------------------------------------------------------------------------+
```

### 9.1 Palette de Couleurs Identitaire ("AFG Executive Theme")
*   **Teinte Majeure (Confiance & Régulation)** : *Émeraude Profond d'Afrique Centrale* (`#065F46` / `#10B981`). Représente la croissance économique locale, l'accréditation et l'ancrage régional de la banque Atlantique.
*   **Teinte d'Appui (Autorité Financière)** : *Bleu Marine d'Affaires* (`#0f172a` au `#1E3A8A`). Renvoie à la rigueur de gestion imposée par l'organe de régulation COBAC et à l’étanchéité des coffres-forts numériques.
*   **Couleur de Contrecoup (Soin de l'agent)** : *Aura Ambre Fin* (`#D97706`). Indique les demandes d'absences en cours d'évaluation, ou les dossiers candidats d'onboarding à auditer urgemment.
*   **Fonds de Toile** : *Fond Clair Ardoise Blanche* (`#F8FAFC`). Augmente la netteté des grilles chiffrées de paie et la clarté d'examen des contrats d'embauche.

### 9.2 Principes de Typographie Pairing
*   **Sanskrit Headings (Titres majeurs)** : Utilisation de la police sans-serif géométrique **Inter** ou **Space Grotesk** pour exprimer le sérieux et le dynamisme d'Atlantique Group.
*   **Mono-Metrics (Chiffres administratifs & Certificats)** : Utilisation de la police technique **JetBrains Mono** pour afficher les matricules de badges d'accès physique (ex: `AFG-0524`), les dates de rétention de fichiers, et les hashs cryptographiques indélébiles des documents GED.

### 9.3 Comportement Mobile (Responsive Adaptive Density)
*   Chaque bouton d'action respecte un gabarit cliquable d'au moins **44px** pour prévenir les erreurs de dactylographie des directeurs d'agences lors de la signature de documents de paie sur tablettes ou smartphones.
*   La barre de navigation se replie de façon asynchrone sur connecteurs tactiles en accordéon fluides assistés par le moteur d'animation `motion` de React (`motion/react`).

---

## 10. PLAN D'EXAMEN DE CONFORMITÉ ET STRATÉGIE DE DÉPLOIEMENT

### 10.1 Pipeline de Tests Applicatifs (Verification Loop)
Avant toute validation finale, la suite de conformité technique est exécutée de façon unifiée :
1.  **Examen Statique de Conformité (Linter)** : Permet de rejeter instantanément les variables orphelines, les imports ES Modules tronqués et d'assurer le typage strict TypeScript :
    ```bash
    npm run lint
    ```
2.  **Compilation Générale de Production** : Génère l'arborescence des fichiers statiques d'interface client (`dist/`) et assemble le contrôleur de backend unifié (`dist/server.cjs`) pour déploiement immédiat en une seule commande autonome :
    ```bash
    npm run build
    ```

### 10.2 Gestionnaire d'Erreurs de Démarrage (Startup Safety)
Pour écarter le risque de blocage infini d'image de conteneur en cas d'absence de variable d'environnement ou de mauvaise connectivité, le chargeur applicatif :
*   Valide de façon asynchrone la présence de la clé secrète d’administration `process.env.GEMINI_API_KEY` lors du chargement des modules d'aide décisionnelle technique, sans bloquer le boot global Express.
*   Gère d'éventuels échecs de persistance locale ou de base de données en basculant en mode dégradé in-memory synchrone, notifiant les auditeurs de sécurité d'un statut "Temporaire" dans le tableau d'administration de la banque.

---
**Fait à Libreville (Gabon), le 30 Mai 2026**  
*Pour la Direction de l'Information et des Ressources Humaines d'AFG Bank Gabon.*  
**Aimé Mbili — Directeur Sécurité & Conformité**
