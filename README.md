# StudySync Matcher

Study partner matcher built with React (Vite) and Vercel Serverless APIs, backed by Supabase. Consent-based in-app contact sharing (no emails by default).

## Features

- Create a profile (name, courses, schedule)
- Match scoring using courses, schedule compatibility, and style
- Connections: must connect before proposing a session
- Session proposals with consent prompts to share email/phone
- Acceptance flow adds accepter’s contact (if consented)
- Accepted sessions panel shows shared contacts
- Dark mode default; no theme toggle

## Local Development

```
npm i
npm run dev
```

- Runs on the port printed by Vite (e.g., http://localhost:5173)
- Serverless API routes live in `/api/*`. For local only frontend is served; deploy to Vercel to exercise serverless APIs with Supabase.

## Deployment (Vercel)

Build settings:

- Framework: Vite/React
- Build command: `npm run build`
- Output directory: `dist`
- Serverless API: files under `/api` are deployed as Vercel Functions

Production Environment Variables (Project → Settings → Environment Variables):

- SUPABASE_URL = your Supabase project URL
- SUPABASE_SERVICE_KEY = service role key for server functions
- VITE_SUPABASE_URL = same as SUPABASE_URL (exposed to client)
- VITE_SUPABASE_ANON_KEY = anon key (exposed to client)
- EMAIL_ENABLED = false
- APP_URL = https://<your-vercel-domain>

## Project Structure

```
api/
  accept-session.js       # Accept session (POST id), consent email disabled by default
  propose-session.js      # Create pending session; stores consented contact in note JSON
  connect-request.js      # Create pending connection (no email by default)
  connect-accept.js       # Accept connection (GET), emails disabled
src/
  components/
  pages/
  contexts/ThemeContext.tsx
  lib/supabase.ts
```

## Environment Variables

Frontend (Vite):

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Serverless (Vercel Functions):

- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- APP_URL
- EMAIL_ENABLED=false (keeps email disabled; app uses in-app consent sharing)

Optional (emails, if you later verify a domain with Resend):

- RESEND_API_KEY
- RESEND_FROM (e.g., `StudyNSync <noreply@yourdomain.com>`) and set `EMAIL_ENABLED=true`

## Testing the flows

1) Create two profiles in Production.
2) User A clicks Connect on User B.
3) User B accepts the connection in-app.
4) User A proposes a session → consent prompts to share contact.
5) User B accepts → consent prompts to share contact.
6) “Upcoming accepted sessions” now shows the shared contacts.
