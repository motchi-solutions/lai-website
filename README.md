# Lai Catering

A responsive, accessible event-catering website built with Next.js 16, React 19, and TypeScript. The first iteration implements the supplied Figma direction, a progressive-web-app shell, and a local form-submission preview.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before committing, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Structure

- `src/app` — App Router entry point, global styles, metadata, and PWA manifest
- `src/components` — focused interactive and layout components
- `public/images` — optimized source artwork and photography supplied by Lai
- `public/sw.js` — small network-first offline shell

## Form implementation status

Iteration one keeps submitted form values in ephemeral React state and displays them beneath the form. It does not send, persist, log, or share data.

The next iteration should add a server-only route or Server Action that validates and normalizes the request, verifies reCAPTCHA v3 with a v2 challenge fallback, applies a durable IP/request-key rate limit, and writes through a restricted Google service account to the existing Sheet. Secrets must live in untracked environment variables without a `NEXT_PUBLIC_` prefix. The browser should receive only a generic success or error response.

## Git workflow

Create feature branches from `dev`, use focused conventional commits, and merge reviewed work into `dev`. Promote a verified release from `dev` to `main`. Never commit `.env*`, service-account JSON, API keys, tokens, or customer submissions.
