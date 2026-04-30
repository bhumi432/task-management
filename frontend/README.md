## Frontend (Next.js App Router)

This frontend is part of the **Team Task Manager** monorepo.

### Run locally
From `frontend/`:

```bash
npm run dev -- --port 3000
```

### Environment
Set `frontend/.env.local`:

```env
API_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3002"
```

### Auth
The UI uses `/api/auth/*` Next route handlers to proxy to the Nest backend and store the JWT in an **HTTP-only cookie**.
