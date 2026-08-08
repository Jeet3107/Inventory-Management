# Deployment Guide

## Backend on Render

Backend service must use the `backend` folder.

- Build command: `npm install`
- Start command: `npm start`
- Required environment variables:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `NODE_ENV=production`

The backend already allows:

- `http://localhost:*`
- `https://*.vercel.app`
- `FRONTEND_URL`
- comma-separated `CORS_ORIGINS`

After changing backend code, redeploy the Render service.

## Frontend on Vercel

Import this GitHub repo in Vercel on the free Hobby plan.

Use the repo root as the Vercel project root. The root `vercel.json` handles the `frontend` subfolder:

- Install command: `cd frontend && npm install`
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/build`

The React app uses:

```env
REACT_APP_API_URL=https://inventory-management-backend-t0ob.onrender.com/api
```

If your Render backend URL is different, update this value in:

- `frontend/.env.development`
- `frontend/.env.production`
- `frontend/src/utils/api.js`

After Vercel deploys, test:

- `/login`
- `/register`
- `/`
- browser refresh on `/products` and `/categories`
