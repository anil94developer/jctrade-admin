# jctrade-admin

Vite + React admin panel.

## Local

```bash
npm install
npm run dev
```

Create `.env` (optional):

```bash
VITE_API_URL=http://localhost:4000/api
```

## Deploy (e.g. Render Static Site)

The API URL is **baked in at build time**. Set this in Render **before** build:

```bash
VITE_API_URL=https://jctrade-server.onrender.com/api
```

If `VITE_API_URL` is missing or still `http://localhost:4000`, the browser will call your laptop’s localhost from the user’s machine and you will see failed requests (often reported as a network / CORS issue).

On the **server**, optional `CORS_ORIGINS` (comma-separated) locks which frontends may call the API from a browser. If unset, any origin is allowed. Example:

```bash
CORS_ORIGINS=https://your-admin.onrender.com,https://your-app.onrender.com,http://localhost:5173
```
