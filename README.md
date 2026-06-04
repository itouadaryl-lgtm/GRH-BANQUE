# GRH BANQUE — GED RH AFG Bank Gabon

Application de **Gestion Électronique de Documents (GED) RH** pour **AFG Bank Gabon** : archivage documentaire bancaire, gestion multi-agences, workflows d'accès inter-agences, audit COBAC, cartes professionnelles gabonaises et assistant IA **ARHI** (Gemini).

## Contexte métier

| Domaine | Description |
|---------|-------------|
| **GED / Archives** | Contrats, fiches de paie, CNSS/CNAS, pièces d'identité, diplômes |
| **Multi-agences** | Siège Libreville, Libreville Centre, Owendo, Port-Gentil |
| **RBAC** | 10 rôles (SUPER_ADMIN, DRH, RH_MANAGER, AUDITOR, EMPLOYEE, COMPTABLE, CLIENT…) |
| **Workflows** | Demandes d'accès inter-agences, congés, recrutement |
| **Conformité** | Journal d'audit COBAC, empreintes SHA-256, mode supervision « Voir tout » |
| **Cartes pro** | Badges gabonais avec MRZ, export PDF/PNG |
| **ARHI** | Chatbot IA (Gemini) pour l'assistance RH réglementaire |

## Architecture

```
Frontend React (Vite)  ──►  Backend Express modulaire (port 3000)
                              ├── Persistance double : JSON (data/store.json) + PostgreSQL
                              ├── Tables grh_* (une par collection métier)
                              ├── JWT + bcrypt
                              └── Routes par domaine (server/routes/)

Backend Spring Boot (port 6050) — optionnel, voir afg-bank-archives-rh-backend/
```

Décision détaillée : [docs/BACKEND.md](docs/BACKEND.md)

## Prérequis

- Node.js 20+
- npm

## Lancement local

```bash
npm install
cp .env.example .env.local   # ou créer .env.local
npm run dev                    # http://localhost:3000
```

Variables d'environnement (`.env.local`) :

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Clé API Google Gemini pour ARHI |
| `JWT_SECRET` | Secret de signature JWT (production obligatoire) |
| `DATA_DIR` | Répertoire du fichier JSON (défaut : `./data`) |
| `POSTGRES_ENABLED` | `true` pour activer la persistance PostgreSQL |
| `DATABASE_URL` | URL PostgreSQL (alternative aux variables ci-dessous) |
| `POSTGRES_HOST` | Hôte PostgreSQL (défaut : `localhost`) |
| `POSTGRES_PORT` | Port (défaut : `5432`) |
| `POSTGRES_DB` | Base (défaut : `archives_rh`) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Identifiants |

## Comptes de démonstration

Mot de passe par défaut : **`123`**

| Email | Rôle |
|-------|------|
| `aime.mbili@afgbank.ga` | SUPER_ADMIN |
| `marie.claire@afgbank.ga` | RH_MANAGER |
| `jean.mouala@afgbank.ga` | DRH |
| `pierre.moubamba@afgbank.ga` | COMPTABLE |

## Scripts

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur Express + Vite (hot reload) |
| `npm run build` | Build frontend + bundle serveur |
| `npm start` | Production (dist/) |
| `npm run lint` | Vérification TypeScript |
| `npm test` | Tests API (Vitest + Supertest) |

## Persistance double (JSON + PostgreSQL)

Chaque enregistrement est écrit **simultanément** dans :
- `data/store.json` — fichier local
- **PostgreSQL** — tables `grh_*` (ex. `grh_users`, `grh_documents`, `grh_agencies`…)

```bash
# Démarrer PostgreSQL seul
docker compose up -d postgres

# Puis l'app avec POSTGRES_ENABLED=true dans .env.local
npm run dev
```

Consulter les tables :

```bash
psql -h localhost -U afgbank -d archives_rh
\dt grh_*
SELECT id, data->>'email' AS email FROM grh_users;
```

## Docker

```bash
docker compose up --build
```

Démarre l'application **et** PostgreSQL avec synchronisation automatique.

## Structure du projet

```
├── server/              # Backend Express modulaire
│   ├── routes/          # Routes REST par domaine
│   ├── services/        # JWT, audit
│   ├── store/           # Persistance JSON
│   └── data/seed.ts     # Données initiales AFG Bank
├── src/                 # Frontend React
│   ├── hooks/           # React Query (useGrhQueries, useGrhMutations)
│   ├── services/        # grh.api.ts
│   └── components/      # Vues métier (~32 composants)
├── tests/api/           # Tests d'intégration API
├── docs/BACKEND.md      # Décision architecture backend
└── afg-bank-archives-rh-backend/  # Backend Java (référence prod)
```

## API

- Documentation Swagger : http://localhost:3000/swagger-ui.html (authentification requise)
- OpenAPI JSON : http://localhost:3000/api-docs

## Sécurité

- Authentification JWT HS256 (12 h)
- Mots de passe hashés bcrypt (12 rounds)
- Routes protégées : toutes sauf `POST /api/auth/login`
- Pas de fallback super-admin sans jeton

## Licence

Apache-2.0 — Prototype AFG Bank Gabon.
