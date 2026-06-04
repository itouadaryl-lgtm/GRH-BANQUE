# Décision backend — GRH BANQUE

## Choix retenu : **Express + persistance JSON**

Date : juin 2026

## Contexte

Le dépôt contient deux backends parallèles :

| Backend | Port | État |
|---------|------|------|
| **Express** (`server.ts`) | 3000 | Branché au frontend, couverture fonctionnelle complète |
| **Spring Boot** (`afg-bank-archives-rh-backend/`) | 6050 | Production-ready (JWT, PostgreSQL) mais **non connecté** au frontend |

## Analyse comparative

### Option A — Migration vers Spring Boot (6050)

**Avantages :** JWT réel, PostgreSQL, architecture MVC, OpenPDF/ZXing pour badges.

**Inconvénients :**
- Réécriture de ~50 endpoints côté frontend (URLs, modèles, auth différents)
- Modules Express absents en Java : congés, recrutement, finance, notifications, corbeille avancée
- Double maintenance pendant la migration (semaines de travail)

### Option B — Express + persistance (retenu)

**Avantages :**
- Zéro rupture pour le frontend existant
- Périmètre fonctionnel complet conservé (GED, workflows, congés, finance, ARHI)
- Refactoring incrémental : modules routes/services, JWT, persistance fichier
- Spring Boot reste disponible comme cible long terme pour la production bancaire

**Inconvénients :**
- Pas de PostgreSQL natif (JSON file → migration PostgreSQL possible ultérieurement)
- Moins adapté à très haute charge que Spring Boot + JPA

## Architecture cible

```
server/
├── app.ts                 # Configuration Express
├── data/seed.ts           # Données initiales AFG Bank
├── store/database.ts      # Store + persistance data/store.json
├── middleware/auth.ts     # JWT + contrôle VOIR TOUT
├── services/
│   ├── audit.service.ts
│   └── jwt.service.ts
├── routes/                # Routes par domaine métier
└── swagger/openapi.ts
```

## Persistance

- **Fichier JSON** : `data/store.json` (volume Docker monté)
- **PostgreSQL** : tables `grh_*` (une ligne par entité, colonne `data` JSONB)
- Sauvegarde debounced (500 ms) — écriture **simultanée** JSON + PostgreSQL via `Promise.all`
- Au démarrage : alignement JSON ↔ PostgreSQL (`initDualStorage`)
- Si PostgreSQL est injoignable : fallback JSON seul (avertissement console)

## Sécurité

- JWT HS256 signé (`JWT_SECRET` en variable d'environnement)
- Mots de passe hashés bcrypt (12 rounds)
- Suppression du fallback « Super Admin sans token »
- Routes `/api/auth/login` publique ; toutes les autres protégées

## Évolution future

1. **Court terme** : Express modulaire + JSON (état actuel)
2. **Moyen terme** : PostgreSQL via `pg` ou Prisma si volumétrie augmente
3. **Long terme** : migration progressive vers Spring Boot pour conformité COBAC production, module par module

## Backend Spring Boot

Conservé dans `afg-bank-archives-rh-backend/` comme référence production. Non supprimé. Docker Compose inclut PostgreSQL pour faciliter son démarrage indépendant.
