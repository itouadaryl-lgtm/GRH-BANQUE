# Persistance double GRH BANQUE

## Principe

Chaque mutation appelle `DualStore.set()` ou `Database.scheduleSave()` qui propage **simultanément** :

1. **JSON** — `data/store.json` (debounce 500 ms)
2. **PostgreSQL** — tables `grh_*` (JSONB, écriture immédiate en transaction)

## Tables PostgreSQL

| Table | Collection |
|-------|------------|
| `grh_users` | users |
| `grh_documents` | documents |
| `grh_agencies` | agencies |
| `grh_folders` | folders |
| `grh_access_requests` | accessRequests |
| `grh_activity_logs` | activityLogs |
| `grh_professional_cards` | professionalCards |
| `grh_roles` | roles |
| `grh_permissions` | permissions |
| `grh_document_types` | documentTypes |
| `grh_system_parameters` | systemParameters |

Structure commune :

```sql
CREATE TABLE grh_users (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Modes de fonctionnement

| Mode | Condition |
|------|-----------|
| `dual` | JSON + PostgreSQL OK |
| `json-only` | PostgreSQL injoignable |
| `pg-only` | JSON en erreur (rare) |

Vérification : `GET /api/health`

## API DualStore

```typescript
await dualStore.set('users', 'u-aime', userData);
await dualStore.delete('documents', 'doc-123');
const user = await dualStore.get('users', 'u-aime');
const list = await dualStore.list('documents', { agencyId: 'ag-siege' });
await dualStore.sync(); // JSON → PG (rattrapage)
```

## Configuration

```env
DATABASE_URL=postgresql://postgres:Postgres123@localhost:5432/archives_rh
POSTGRES_ENABLED=true
```

## Consultation psql

```bash
docker compose up -d postgres
psql -h localhost -U postgres -d archives_rh
\dt grh_*
SELECT id, data->>'email' FROM grh_users;
```
