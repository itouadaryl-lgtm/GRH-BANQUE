# 📘 NOTICE D'UTILISATION
## Système Central d’Archives & d’Accréditations RH — AFG BANK GABON S.A.

Bienvenue dans le guide d'utilisation opérationnel d'**AFG Bank Gabon**. Ce manuel vous guidera à travers les terminologies, la structure applicative et la prise en main rapide des modules intégrés sur la plateforme d'archivage sécurisée de la Direction des Ressources Humaines.

---

## 🚀 1. Démarrage Rapide

L'application démarre dans un état de **Purge Générale à Zéro (0000)** conforme au cahier des charges de mise sous tension.
* **Accès initial** : Pour des raisons de facilité de démonstration, la barre de navigation supérieure propose un bouton **"Permuter de profil"** 👤. Ce module d'identité vous permet d'échanger instantanément votre compte actif parmi les **11 rôles de sécurité** configurés par l'Annuaire Actif LDAP d'AFG Bank.
* **Sélection automatique** : Lorsque vous cliquez sur un compte (ex: **Aimé Mbili** - *Super Admin* ou **Marie Claire** - *DRH / RH Manager*), l'application adapte dynamiquement l'affichage, les dossiers visibles, les boutons d'importation et les registres en accord strict avec les niveaux de sécurité RBAC (Contrôle d'Accès Basé sur les Rôles) prévus.

---

## 📂 2. Navigation et Fonctionnalités Principales

La barre latérale gauche (ou le menu mobile adaptatif) structure l'organisation administrative par onglets :

### A. Tableau de Bord National (Dashboard)
Visualisez instantanément l'activité globale consolidée d'AFG Bank Gabon :
* **Statistiques à Zéro (0000)** : Au premier démarrage, les indicateurs affichent `0` documents indexés, `0` cartes émises, et `50Mo` de quota d'archives vierge.
* **Graphes Dynamiques** : Obtenez la répartition sectorielle de vos documents par branches d'activité, les ratios de validation des cartes professionnelles et l'historique d'audit d'intégrité globale.
* **Bouton "VOIR TOUT" (Supervision Globale)** : Réservé aux directeurs basés au Siège Social (Libreville). Il permet de s'affranchir temporairement de la ségrégation agence (Libreville Centre, Owendo, Port-Gentil) pour scruter l'arborescence matérielle nationale. L'activation de cette commande consigne une entrée immuable dans le registre de sécurité d'un inspecteur.

### B. Gestionnaire d'Habilitations Employés (Profils RH)
* **Recherche & Filtrage** : Localisez les fiches de personnel par matricule unique, nom ou pôle de branches.
* **Création d'Agent** : Intégrez de nouvelles identités d'agents avec définition obligatoire de leur affiliation d'agence gabonaise et de leur grade technique.
* **Fiches d'Accréditation** : Inspectez les profils, modifiez des champs, ou configurez les limitations d'agences décentralisées.

### C. Armoire GED & Dictionnaire d'Archives (Documents)
Zone d'entreposage physique cryptographique de la DRH.
* **Import de Document** : Glissez-déposez n'importe quel contrat de travail (`.pdf`), fiche de paie (`.pdf`), ou pièce d'identité (`.jpg`). Le système calculera instantanément l'empreinte de déduplication SHA-256 à la volée.
* **Classification structurée** : Associez chaque archive à un collaborateur, une catégorie logique (Contrats, Paie, CNSS) et un dictionnaire sectoriel de types.
* **Visualisation** : Accédez à la visionneuse intégrée haute-fidélité pour examiner les documents autorisés.

### D. Coffres de Tri & Classeurs Légaux (Dossiers)
Le système structure l'archivage sous forme de classeurs physiques :
* **Dossiers Employés** : Conteneurs globaux regroupant l'ensemble des documents d'un collaborateur spécifique.
* **Flux de création** : Créez de nouveaux dossiers de branches pour structurer l'arborescence avant téléversement.

### E. Workflow de Dérogation Administrative (Accréditations)
* Lorsqu'un personnel ne dispose pas intrinsèquement de l'habilitation d'accès à un document confidentiel (ex: bulletin de salaire d'un tiers), il peut formuler une **Demande d'Accréditation**.
* **Motif obligatoire** : La demande doit spécifier un argument d'enquête ou d'audit solide.
* **Validation / Rejet** : Un Directeur habilité (DRH ou Super Admin) examine la demande, la valide en insérant d'éventuels commentaires d'autorisation temporaires, débloquant automatiquement la consultation pour l'agent demandeur.

### F. Générateur de Badges et Cartes Professionnelles de Sécurité
* **Émission** : Permet de générer instantanément un badge officiel de sécurité d'AFG Bank Gabon pour un agent du personnel.
* **Éléments de Sécurité** : La carte intègre le matricule, le poste, le logo de l'institution, le cachet d'inspecteur central de la DRH, et un **QR Code d'authentification national**.
* **Exportation** : Exportez la carte générée en PDF d'impression officiel, en format PNG, ou lancez un aperçu de test d'impression physique.

### G. Registre d'Audit Immuable (Logs)
Exigé par l'organisme de régulation **COBAC** :
* Chaque clic, consultation de document, importation, suppression ou changement de privilège est tracé d'une signature numérique introublable.
* Affiche : IP du terminal de la banque, rôle actif, date à la microseconde, et ressource ciblée.

### H. Poubelle & Rétention Temporaire (Corbeille)
* Les documents supprimés ne sont pas immédiatement détruits du disque central d'AFG Bank.
* Ils entrent dans la zone d'archivage temporaire pour un délai de rétention configurable par le moteur (ex: **30 jours**). Un décompte visuel est affiché.
* Possibilité de restauration ou de purge définitive selon les habilitations d'audit.

---

## 🤖 3. Assistant de Recherche IA "ARHI"

Le volet droit de l'application loge notre modèle d'intelligence artificielle locale spécialisé : **ARHI** (*Archives RH Intelligent*).
* **Focalisation Intelligente** : Saisissez n'importe quelle requête en langage naturel (ex: *"Affiche-moi le contrat d'Aimé Mbili"*, *"Quelles sont les pannes ou anomalies d'archives ?"*, *"Vérifie les expirations de fiches d'identité"*).
* **Indexation Sémantique** : L'IA identifie les entités cibles et guide vos filtres dynamiques au sein de la GED.

---

## ⚙️ 4. Paramétrage & Réinitialisation à Zéro

Dans l'onglet **Paramètres** :
1. **Général** : Configurez le nom de l'institution d'archivage, modifiez le fuseau horaire de Libreville (`WAT`), ou commutez les formats d'horodatage.
2. **Zone de Danger (Purger l'application)** : Un bouton rouge crucial **"Réinitialiser l'application à zéro (0000)"** est mis à disposition. En cas d'essai prolongé ou d'intégration de fausses données de tests, cliquez sur ce bouton pour réinitialiser de façon absolue toutes les structures en mémoire de la GED. Les compteurs du tableau de bord repasseront instantanément à zéro, prêt pour une nouvelle démonstration de conformité impeccable.

---
*Droits Réservés d'AFG BANK GABON S.A. © Direction de l'Audit & de la Sécurité Informatique Séguy Mbili.*
