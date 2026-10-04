# Base44 development notes

- Use `docker compose -f docker-compose.base44.yml up -d --build` for the preview, not the production Dockerfile or original compose. Express embeds Vite; both UI and API share port 3000. The Java backend is not connected to this frontend and is not needed.
- App source is bind-mounted; startup runs `npm ci` against the committed lockfile, then `tsx watch server.ts`. Vite uses polling for frontend edits.
- `/api/health` is public. Healthy storage reports `{"success":true,"data":{"pg":"ok","json":"ok","mode":"dual"}}`. Compose checks this and that `/` serves the live `/src/main.tsx` entry.
- PostgreSQL schema and demo data initialize automatically in `DualStore.create()`. Named volumes retain PostgreSQL, JSON data, and uploads; never delete these to refresh dependencies.
- `/run/base44/app.env` contains platform-managed secrets; never print its values or commit a copy. JWT_SECRET is generated for development. GEMINI_API_KEY is optional: the existing chatbot falls back to simulation without it.
- Demo login: `aime.mbili@afgbank.ga` / `123`. Verified login reaches `/dashboard` and authenticated collection requests return 200.
- Tests: `docker compose -f docker-compose.base44.yml exec -T app npm test`; type check: same command with `npm run lint`.
