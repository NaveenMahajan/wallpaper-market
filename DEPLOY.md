# Deploy Instructions (Frontend -> Netlify, Backend -> Vercel)

1. Create a GitHub repository and push this project (root contains `frontend/` and `api/`).

2. Deploy Backend on Vercel:
   - Import the GitHub repo into Vercel.
   - Set Environment Variables in Vercel project settings:
     - STRIPE_SECRET_KEY = sk_test_xxx
     - SUCCESS_URL = https://<your-netlify-site>.netlify.app
     - CANCEL_URL = https://<your-netlify-site>.netlify.app
     - ADMIN_TOKEN = choose_a_secret_token_for_admin (used by admin)
   - Vercel will expose functions at: https://<your-vercel>.vercel.app/api/*

3. Deploy Frontend on Netlify:
   - Import the same GitHub repo into Netlify.
   - Build command: `cd frontend && npm ci && npm run build`
   - Publish directory: `frontend/dist`
   - Set Environment Variables in Netlify:
     - VITE_STRIPE_PK = pk_test_xxx
     - REACT_APP_API_BASE = https://<your-vercel>.vercel.app
   - Add `_redirects` in `frontend/` to proxy api calls if you prefer:
     `/api/*  https://<your-vercel>.vercel.app/api/:splat 200`

4. Webhooks:
   - Configure Stripe webhook endpoint on Vercel: `/api/webhook`.
   - Use webhook secret in Vercel env (STRIPE_WEBHOOK_SECRET) and implement verification.

This starter uses a demo JSON file `api/purchases.json` to track purchases for HD access. Replace with a real DB (Postgres/Redis) in production.
