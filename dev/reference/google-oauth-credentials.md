# Google OAuth — Watch-Buddy

Watch-Buddy uses **Better Auth** with a single-app OAuth flow (unlike Finance Buddy’s split API/web workers). Google callbacks land on the **same host** as the app.

GCP project used for personal apps: **`251478266967`** (same as Finance Buddy). You can reuse the existing Web OAuth client and add Watch-Buddy URIs below.

## Google Cloud Console

[Credentials → OAuth 2.0 Client IDs](https://console.cloud.google.com/apis/credentials?project=251478266967)

### Authorized JavaScript origins

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:3000` |
| Production | `https://watch-buddy.geass.workers.dev` |

### Authorized redirect URIs

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:3000/api/auth/callback/google` |
| Production | `https://watch-buddy.geass.workers.dev/api/auth/callback/google` |

**Do not** use `/auth/callback` — Better Auth handles Google at `/api/auth/callback/google`.

### Scopes

Default Better Auth Google sign-in: `openid`, `email`, `profile`. No Gmail scopes.

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GOOGLE_CLIENT_ID` | `.dev.vars`, Wrangler secret | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `.dev.vars`, Wrangler secret | OAuth client secret |
| `BETTER_AUTH_SECRET` | `.dev.vars`, Wrangler secret | Session/cookie signing (still required) |
| `BETTER_AUTH_URL` | `wrangler.jsonc` (prod), `.dev.vars` (local) | Public app URL |
| `BETTER_AUTH_TRUSTED_ORIGINS` | same | Comma-separated allowed origins |
| `NEXT_PUBLIC_APP_URL` | `wrangler.jsonc` (prod) | Auth client `baseURL` in browser |

### Local (`.dev.vars`)

```bash
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Production secrets

```bash
scripts/wrangler-personal.sh secret put GOOGLE_CLIENT_ID
scripts/wrangler-personal.sh secret put GOOGLE_CLIENT_SECRET
```

Production non-secret URLs live in `wrangler.jsonc` `vars`.

## Troubleshooting `redirect_uri_mismatch`

1. Read `redirect_uri` from the Google error page.
2. Open the OAuth client matching that `client_id` in GCP Console.
3. Add the **exact** URI (no trailing slash).
4. Wait 1–2 minutes after saving.

## Custom domain (future)

When you add a custom domain (e.g. `https://watchbuddy.example.com`), update:

- Google Console: JS origin + redirect URI for the new domain
- `wrangler.jsonc`: `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `NEXT_PUBLIC_APP_URL`
