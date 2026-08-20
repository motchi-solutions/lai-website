# Lai Catering

A responsive, accessible beverage-catering website built with Next.js 16, React 19, and TypeScript. The contact form uses client and server validation, reCAPTCHA Enterprise policy-based challenges, durable rate limiting, and keyless Google Sheets access through Vercel OIDC.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local Google Sheets writes, the application also needs a Vercel development OIDC token:

```bash
npx vercel link
npx vercel env pull .env.development.local
npm run dev
```

The Google Workload Identity binding must authorize the exact Vercel subject ending in `environment:development`. Pulling to `.env.development.local` preserves separately maintained values in `.env.local`.

Before committing, run:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Structure

- `src/app` — App Router entry point, global styles, metadata, and PWA manifest
- `src/components/home/sections` — home-page content sections
- `src/components/home/contact` — contact form and its section wrapper
- `src/components/home/shared` — shared section animation and presentation constants
- `src/components/layout` — site navigation, footer, and service-worker registration
- `src/lib` — server integrations, validation, and rate limiting
- `public/images` — optimized source artwork and photography supplied by Lai
- `public/sw.js` — small network-first offline shell

## Contact form configuration

Configure these values locally in `.env.local` and in the deployment environment. Never commit them.

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=policy_based_challenge_key_id
GOOGLE_RECAPTCHA_API_KEY=restricted_google_cloud_api_key
GCP_PROJECT_ID=google_cloud_project_id
GOOGLE_SHEETS_SPREADSHEET_ID=spreadsheet_id_from_its_url
GCP_PROJECT_NUMBER=123456789012
GCP_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_POOL_ID=vercel
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=vercel
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

The Google variables above use keyless Vercel OIDC and Google Workload Identity Federation. There is no private-key fallback. Only the reCAPTCHA site key is public; never give the remaining Google, GCP, or Upstash variables a `NEXT_PUBLIC_` prefix.

The API first appends to the worksheet range `'Form Responses'!A:E`. If Google reports that range as invalid, it safely retries the `form_responses` named range/table identifier. The columns must be `Submitted at`, `Name`, `Email`, `Organization`, `Event details` in that order. Submission times are stored as readable Toronto time and automatically use EST or EDT. Production fails closed if durable rate limiting is not configured. Local development uses a process-local fallback limiter so the UI can be tested without Redis.

## Production integrations

- Enable Vercel OIDC Federation and authorize the exact Vercel project/environment subject as `roles/iam.workloadIdentityUser` on the form service account.
- Share only the destination Sheet with that service account as Editor.
- Configure an Upstash Redis database using its REST URL and REST token; no schema or migrations are required.
- Restrict the reCAPTCHA server API key to the reCAPTCHA Enterprise API.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS production origin and redeploy after environment changes.

The application includes file-based icons and social images, `robots.txt`, `sitemap.xml`, structured data, a web app manifest, an offline shell, security headers, request-size/origin checks, a honeypot, and safe server-side error handling.

## Temporary Vercel domain

The site and contact form work fully on a stable `*.vercel.app` project domain before the custom domain is connected. For a client-testing deployment:

- Add every required environment variable to the correct Vercel environment. Preview deployments require Preview-scoped variables; the stable production project domain uses Production-scoped variables.
- Set `NEXT_PUBLIC_SITE_URL` to the exact temporary HTTPS hostname so canonical URLs, social metadata, the sitemap, and structured data agree. Replace it with the custom domain and redeploy at launch.
- Add the exact temporary hostname to the reCAPTCHA Enterprise website-key domain list. Add the custom hostname before launch.
- Authorize the matching Vercel OIDC subject in Google WIF. Preview deployments use a subject ending in `environment:preview`; production deployments use `environment:production`.
- Use Vercel Deployment Protection when the review site should remain private. An unprotected deployment is publicly reachable and may be indexed.

## Logging and privacy

Successful submissions and expected bot rejections are not logged. Unexpected reCAPTCHA infrastructure failures and Google Sheets storage failures retain only operational metadata such as the integration stage, safe error code, HTTP status, and the user-visible reference ID. Names, email addresses, event details, IP addresses, CAPTCHA tokens, OIDC tokens, and credentials must never be written to application logs.

## Regular maintenance

- Monthly: submit one test enquiry, confirm it appears in the correct Sheet with Toronto time, and verify the success and error states on mobile and desktop.
- Monthly: review Vercel function errors, Upstash usage/rate-limit activity, reCAPTCHA metrics, and Google Cloud audit activity for unexpected changes. Do not export or retain customer data unnecessarily.
- Before each release: run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and review dependency/security update notices.
- After integration changes: test the browser → `/api/contact` → reCAPTCHA → rate limiter → Google Sheets flow in the affected Vercel environment.
- After domain changes: update `NEXT_PUBLIC_SITE_URL`, reCAPTCHA allowed domains, and any external listings; redeploy and verify canonical, sitemap, Open Graph, and Twitter URLs.
- After PWA shell or icon changes: increment the cache name in `public/sw.js`, then verify install, update, and offline navigation in a production build.
- When local OIDC expires: refresh `.env.development.local` with `npx vercel env pull .env.development.local --yes`, then restart the development server.
- Quarterly: update dependencies deliberately, rotate the reCAPTCHA API key and Upstash token when required by policy, remove obsolete Vercel deployments/environment variables, and recheck least-privilege access to the Sheet and service account.

`public/sw.js` is the PWA service worker. It is registered only in production, caches the application shell and same-origin static assets, uses the network first for page navigation, and deliberately excludes `/api/*` so contact requests and responses are never cached.

## Git workflow

Create feature branches from `dev`, use focused conventional commits, and merge reviewed work into `dev`. Promote a verified release from `dev` to `main`. Never commit `.env*`, service-account JSON, API keys, tokens, or customer submissions.
