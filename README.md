# StudySync Matcher

Study partner matcher with React + Express + MongoDB (Atlas). Deployable on Netlify via Functions.

## Features

- Create a profile (name, courses, schedule, study style)
- Top-5 matches scored by:
  - 60% shared courses ratio
  - 25% schedule non-overlap (HH:MM tokens)
  - 15% same study style
- MongoDB Atlas persistence with in-memory fallback for dev

## Local Development

Frontend:

```
npm i
npm run dev
```

- Runs on the port printed by Vite (e.g., http://localhost:5173)
- Root `.env`:

```
VITE_API_URL=http://localhost:5000
```

Backend:

```
cd backend
npm i
npm run dev
```

- Runs on http://localhost:5000
- `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<URL_ENCODED_PASSWORD>@<cluster>.mongodb.net/studysync?retryWrites=true&w=majority&appName=<app>
PORT=5000
```

- Health: `http://localhost:5000/health`
- Users: `http://localhost:5000/api/users`

## Netlify (Frontend + Functions)

This repo includes a Netlify Function wrapping the Express app.

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Environment variables:
  - `MONGO_URI` = your Atlas URI (password URL‑encoded)
  - Option A: `VITE_API_URL=/.netlify/functions/api`
  - Option B: keep frontend using `/api/*` (redirect provided in `netlify.toml`)

After deploy:

- `/.netlify/functions/api/health` → `{ ok: true }`
- `/api/users` → users list/seed

## Project Structure

```
backend/
  models/, routes/, utils/
  server.js            # local dev (Express listen)
  serverless-app.js    # Netlify Functions export (no listen)
netlify/functions/api.js  # serverless handler
netlify.toml              # build + redirects
src/ ...                  # frontend
```

## Notes

- Do not commit secrets; keep `backend/.env` local. Set `MONGO_URI` in Netlify.
- If hosting backend elsewhere, set `VITE_API_URL` to that URL and add it to CORS in `backend/server.js`.
