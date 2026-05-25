# Hostinger API (`api.crownevcenter.com`) — 503 fix

A **503** page with “The server is temporarily busy” means **Node.js is not running** on Hostinger (not a frontend/Vercel bug).

## Quick check

Open: `https://api.crownevcenter.com/health`

- **OK:** `{"status":"OK",...}`
- **503:** backend down — follow steps below

The public site (`www.crownevcenter.com`) can work while the API is down; login and data will fail until `/health` is OK.

## Hostinger Node.js settings

| Setting | Value |
|--------|--------|
| **App root** | `backend` (folder that contains `package.json` with `"start": "node src/server.js"`) |
| **Node version** | 20.x |
| **Install** | `npm install` |
| **Build** (if available) | `npx prisma generate` |
| **Start** | `npm start` |

## Required environment variables

```
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
JWT_SECRET=<long random string>
NODE_ENV=production
PORT=<set by Hostinger — do not hardcode in code>

# Email (OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Cloudflare R2 (uploads)
R2_BUCKET_NAME=crown-eve-media
R2_PUBLIC_URL=https://pub-....r2.dev
R2_ENDPOINT_URL=https://....r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

Optional: `PRISMA_NEON_ADAPTER=1` (default on for Neon in production).

## After each GitHub push

Hostinger does **not** auto-deploy from GitHub Actions. In hPanel:

1. **Deployments** → pull latest / redeploy  
2. **Restart** the Node app  
3. Open **Logs** — look for `JWT_SECRET`, `DATABASE_URL`, `Prisma`, or `EADDRINUSE`

## Common log errors

| Log message | Fix |
|-------------|-----|
| `JWT_SECRET env var not set` | Add `JWT_SECRET` in env, restart |
| `Missing env: DATABASE_URL` | Add Neon `DATABASE_URL`, restart |
| `Prisma Client did not initialize` | Run `npx prisma generate` in build step |
| `Database connection timed out` | Check Neon project is active; URL correct |

## DNS

`api.crownevcenter.com` → Hostinger (Node app), **not** Vercel.

`www.crownevcenter.com` / `crownevcenter.com` → Vercel (frontend).
