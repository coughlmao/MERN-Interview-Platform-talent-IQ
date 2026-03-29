# Talent IQ (MERN Interview Platform)

Talent IQ is a real-time collaborative coding interview platform built with the MERN stack.
It lets users create and join live coding sessions with video calling, chat, and an in-browser code editor.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, DaisyUI, React Query, Clerk
- Backend: Node.js, Express, MongoDB, Mongoose, Clerk, Inngest
- Real-time: Stream Video + Stream Chat
- Code execution: Piston API integration

## Core Features

- Clerk-based authentication (sign-in required for protected routes)
- Create session rooms for predefined coding problems and difficulty levels
- Join active sessions (max 2 participants per session)
- Live video call per session (Stream Video)
- Real-time chat per session (Stream Chat)
- Monaco-based code editor with multi-language support
- Run code from the browser using Piston execution API
- Session lifecycle management (active/completed)
- Dashboard with active and recent sessions

## Project Structure

```txt
.
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- lib/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- server.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- lib/
|   |   `-- pages/
|   `-- package.json
`-- package.json
```

## Local Setup

### 1) Prerequisites

- Node.js 20+ recommended
- npm 10+
- MongoDB database (local or Atlas)
- Clerk account/app
- Stream account/app (API key + secret)

### 2) Install dependencies

From the repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3) Configure environment variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DB_URL=<your_mongodb_connection_string>

# Clerk (backend)
CLERK_SECRET_KEY=<your_clerk_secret_key>

# Stream (server-side)
STREAM_API_KEY=<your_stream_api_key>
STREAM_API_SECRET=<your_stream_api_secret>

# Frontend URL allowed by CORS
CLIENT_URL=http://localhost:5173

# Inngest (optional locally, required if using Inngest cloud sync)
INNGEST_EVENT_KEY=<your_inngest_event_key>
INNGEST_SIGNING_KEY=<your_inngest_signing_key>
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
VITE_STREAM_API_KEY=<your_stream_api_key>
```

### 4) Run the app in development

Run backend:

```bash
npm run dev --prefix backend
```

Run frontend (new terminal):

```bash
npm run dev --prefix frontend
```

Open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:3000/health

## API Overview

Base path: `/api`

- `GET /chats/token` - Get Stream token for authenticated user
- `POST /sessions` - Create a session
- `GET /sessions/active` - Fetch active sessions
- `GET /sessions/my-recent` - Fetch recent completed sessions for current user
- `GET /sessions/:id` - Fetch session details
- `POST /sessions/:id/join` - Join a session
- `POST /sessions/:id/end` - End a session (host only)

All API routes above are protected and require Clerk authentication.

## Deploy on Render

This repository is set up to deploy as a single Render Web Service from the repo root.
In production, Express serves the built frontend from `frontend/dist`.

### 1) Create a Web Service

- Connect your GitHub repo to Render
- Environment: `Node`
- Root directory: repo root (leave blank)
- Build command:

```bash
npm run build
```

- Start command:

```bash
npm start
```

### 2) Add Render environment variables

Set these in Render service settings:

```env
NODE_ENV=production
DB_URL=<your_mongodb_connection_string>

CLERK_SECRET_KEY=<your_clerk_secret_key>
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>

STREAM_API_KEY=<your_stream_api_key>
STREAM_API_SECRET=<your_stream_api_secret>
VITE_STREAM_API_KEY=<your_stream_api_key>

# Your Render public URL, for example: https://talent-iq.onrender.com
CLIENT_URL=<your_render_service_url>
VITE_API_BASE_URL=<your_render_service_url>/api

INNGEST_EVENT_KEY=<your_inngest_event_key>
INNGEST_SIGNING_KEY=<your_inngest_signing_key>
```

Important notes:

- Render provides `PORT` automatically; do not hardcode it in Render.
- `VITE_*` variables are build-time frontend variables and must be present before Render builds.
- If Clerk webhooks are configured, ensure webhook/event delivery is pointed to your deployed backend as needed.

### 3) Redeploy and verify

After setting env vars, trigger a new deploy and verify:

- `GET /health` returns 200
- Sign-in works
- Session creation/join works
- Video + chat connect successfully

## Production Checklist

- MongoDB network access allows Render outbound IPs (or open access with strong credentials)
- Clerk frontend and backend keys are from the same Clerk application
- Clerk allowed origins / redirect URLs include your Render domain
- Stream API key/secret are valid and not rotated unexpectedly
- CORS `CLIENT_URL` exactly matches your deployed frontend origin

## Troubleshooting

### Frontend shows blank page or crashes on load

- Check `VITE_CLERK_PUBLISHABLE_KEY` is set in `frontend/.env` (local) or Render env vars (production).
- Check `VITE_STREAM_API_KEY` is set and valid.
- Rebuild after changing any `VITE_*` variable. These values are injected at build time.

### API requests fail with CORS errors

- Confirm backend `CLIENT_URL` exactly matches your frontend origin:
- Local: `http://localhost:5173`
- Render: `https://<your-service>.onrender.com`
- Ensure `VITE_API_BASE_URL` points to the backend `/api` path.

### Clerk auth works in UI but backend returns 401/404

- Confirm `CLERK_SECRET_KEY` is configured on the backend.
- Ensure frontend and backend keys come from the same Clerk application.
- Verify Clerk webhook/events are configured if you rely on user sync to MongoDB.
- If user records are missing in MongoDB, protected routes may return `User not found`.

### Stream video/chat does not connect

- Verify `STREAM_API_KEY` and `STREAM_API_SECRET` on backend.
- Verify `VITE_STREAM_API_KEY` on frontend matches the same Stream app.
- Confirm the authenticated Clerk user has been synced/upserted before joining a session.

### Render deploy succeeds but app fails at runtime

- Check Render logs for missing env variables.
- Ensure `NODE_ENV=production` is set.
- Confirm MongoDB allows connections from Render.
- Make sure Build Command is `npm run build` and Start Command is `npm start`.

### Inngest sync issues

- Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in backend env vars.
- Verify event/webhook routing targets your deployed backend.
- Check the `/api/inngest` route is reachable from Inngest.

## License

This project is available for use. Please check with the repository owner for specific licensing information.