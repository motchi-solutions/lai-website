# Agent instructions

These are the shared Motchi rules. They are the same in every Motchi repository.

## Read CONTEXT.md first, every time

Before any task, read [CONTEXT.md](CONTEXT.md). It holds this project's stack, commands, branches and rules. Read it again at the start of each new task, even in the same session.

- CONTEXT.md adds to these rules. If they disagree, CONTEXT.md wins for project detail, but it can never relax a security or secrets rule here.
- If something you learn about the project should last, put it in CONTEXT.md, not here.

## How to respond

Keep replies short, clear and simple. More words is not better.

- **Lead with what matters.** Put problems, blockers and needed fixes first, in one or two lines each. Then the rest.
- **Plain language.** Short sentences. Common words. No complex grammar, no filler, no jargon unless the reader uses it.
- **Do not narrate.** Do not list every small step you took. Say what changed, what you checked, and what is left.
- **Keep the details that matter.** Short does not mean vague. Name the file, the command, the error, the number.
- **Back and forth.** Answer the question asked. If something is unclear, ask one short question instead of guessing at length.
- **Be honest.** Say what you verified and what you did not. Never claim a check you did not run.

"If you can't explain it simply, you don't understand it well enough." (often credited to Einstein). The Feynman technique says the same: explain it as if to a beginner, and where you get stuck is where your understanding is weak. Apply this to every answer. If you need a long paragraph, first make sure you understand the point.

## Workflow

1. Read CONTEXT.md, then the code and docs that the task touches.
2. Make a short plan. For anything large or risky, share it before you start.
3. Make the smallest change that solves the task. Follow existing patterns.
4. Check your work: lint, type check, tests, build (the commands are in CONTEXT.md). For UI, look at it in a browser when you can.
5. Report briefly: issues first, then what changed, then what was checked.

## Git and branches

- CONTEXT.md says which branch model the repo uses:
    - **develop flow** (websites, apps): `main` is production, `develop` is integration. Branch from `develop` and merge back into it. Only release or hotfix work goes to `main`. Dependabot targets `develop`.
    - **trunk-based** (Motchi Verify repos): `main` is the only long-lived branch. Short-lived branches from `main`. Environments are not branches.
- Branch names: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`, `hotfix/<short-name>`, `release/<version>`. Add a ticket ID when there is one, for example `feature/MOTCHI-126-runtime-secrets`. Dependabot uses `dependabot/...` on its own. No personal or long-lived extra branches (`dev`, `staging`, `backup/...`).
- Do not commit, push, open pull requests, merge or deploy unless the user asks.
- Never force-push or rewrite shared history without explicit approval.

## Secrets and environment files

- Never read, print, search, copy or summarize `.env`, `.env.*`, keys, certificates, credentials or secret-manager output. This includes `printenv`, `env` and logging `process.env`.
- `.env.example` may be read and edited. It holds placeholders only.
- When a variable needs to change: name it, say where it goes (local file or host environment), give the format with a placeholder, and ask the user to set it. Do not check it by reading it back.
- Never put secrets in code, logs, reports, commits or chat.

## Skills, tools and network calls

- Skills live in `.agents/skills/` and are recorded in `skills-lock.json`. The skill tracker is [docs/SKILLS.md](docs/SKILLS.md): what each skill does, its source, and whether it runs scripts or uses the network. Refresh it with `node scripts/skill-inventory.mjs` after adding, removing or updating a skill, unless CONTEXT.md says otherwise.
- Use only the skills that fit the task. CONTEXT.md may give an order of use.
- Reading a skill's instructions does not allow running its scripts. Before running any third-party script, CLI, installer or binary, read its source and check what it touches: network, files, credentials, subprocesses.
- Do not make network calls (web, APIs, downloads, uploads, browser automation, telemetry) unless the user asked for that kind of access in this task. If you need it, say why, where and what data, then wait.
- Do not use a tool or path that has a known, unfixed vulnerability. Stop and report it.
- Send the least data needed. Never upload private code, secrets or customer data without explicit approval. Never publish anything unless asked.

## Dependencies

- The dependency tracker is [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md). Refresh it with `node scripts/dependency-inventory.mjs` after any dependency change, unless CONTEXT.md names another command. Fill in the Purpose column for new packages.
- Before you add a package, check that it is needed, maintained, licensed for our use and has no open advisories. Prefer what the project already uses.
- Commit lockfiles. Use `npm ci` (or `uv sync --locked`) for clean installs. Do not run `npm audit fix --force` without reviewing what it changes.
- Pin GitHub Actions to a full commit SHA with a version comment: `uses: actions/checkout@<sha> # v7.0.1`.
- Dependabot PRs: read the release notes, check the lockfile changed only as expected, run the project checks, and look closely at major versions. Do not merge on a green status alone.

## Security review

- Use the [security-audit](.agents/skills/security-audit/SKILL.md) skill in focused mode for security-sensitive changes: auth, APIs, forms, uploads, payments, webhooks, databases, secrets, sessions, CORS/CSP, infrastructure and important dependency changes. Styling and copy changes do not need it.
- Run a full audit only when asked, before a launch or major release, or after an incident or major trust-boundary change.
- Label findings `confirmed`, `needs validation`, `informational` or `rejected`. Verify before calling something a vulnerability.
- Do not probe live systems to prove a finding. Keep untrusted code isolated: no network, no credentials, scratch-only writes.

## Website standard

Every Motchi website and client website uses the same platform pieces. This keeps sites secure and makes new ones quick to set up. Do not add alternatives (other analytics, captchas, trackers, hosts) without the user's approval. The Motchi Verify apps follow their own architecture and are not covered here.

- **Site URL:** the production origin lives in `src/lib/site.ts` (`site.url`), with business facts (name, address, phone, social links). Use `siteUrl()`, `absoluteUrl()` and `indexingAllowed()` from there; never read a URL from an environment variable. `siteUrl()` gives localhost in development, the branch URL on Vercel Previews and `site.url` in Production. `SITE_URL` is an optional override (for example another local port).
- **SEO:** every public page sets its own title, description and `alternates.canonical` (never rely on a canonical inherited from the root layout). `metadataBase` comes from `siteUrl()`. Pages are noindex unless `indexingAllowed()` (Vercel Production only). `robots.ts` allows crawling only in Production and disallows APIs and private pages; `sitemap.ts` lists public routes only, without invented `lastModified` or `priority`. Add schema.org JSON-LD for the business through `JsonLd` (`src/components/seo/json-ld.tsx`), using only facts shown on the site. Private, signed-in and admin pages are noindex and disallowed.
- **Environment variable names:** UPPER_SNAKE_CASE. Use `NEXT_PUBLIC_` only for values the browser must read. Provider credentials keep the provider's prefix (`BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`, `NOTION_TOKEN`, `UPSTASH_REDIS_REST_URL`). App settings use a feature prefix: `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CONTACT_CC_EMAIL` for contact forms, `EMAIL_FROM_ADDRESS`/`EMAIL_FROM_NAME` for app email. IDs end in `_ID`; secrets end in `_SECRET`, `_KEY` or `_TOKEN`. Facts the code can know (URLs, address, phone) belong in `src/lib/site.ts`, not in environment variables.
- **Hosting and CDN:** Vercel. Pages and assets are served from Vercel's global CDN. `main` deploys to Production; `develop` and pull requests deploy to Preview. Domains and host redirects live in Vercel's domain settings, not in `next.config`.
- **Analytics:** Vercel Web Analytics (`@vercel/analytics`), loaded on Vercel Production only. It is cookie-free and anonymous. Send only the page path plus `utm_*` tags; strip every other query string and fragment, since they can hold personal data. No Google Analytics, tag managers, ad pixels or session replay.
- **Bot protection:** Cloudflare Turnstile on every public form, with action `contact` (or the form's own action). The server must verify every token with Cloudflare's siteverify API and check `success`, `action` and `hostname`. Never trust the widget alone. No Google reCAPTCHA. Variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public) and `TURNSTILE_SECRET_KEY` (server only). Cloudflare test keys work for local development.
- **Security headers:** if the site sets a Content Security Policy, allow `https://challenges.cloudflare.com` for scripts and frames. Vercel Analytics loads from the same origin (`/_vercel/insights`).
- **Privacy policy:** every site with a form or analytics needs one. It must name Vercel (hosting, CDN and analytics), Cloudflare Turnstile, and each form, email or database provider. Update it in the same change that adds or removes a provider.
- **Motchi credit:** client footers link to `https://www.motchi.ca/websites?utm_source=<client>&utm_medium=referral&utm_campaign=client-footer` with `rel="noopener"`, not `noreferrer`, so the referrer still shows in Motchi's analytics.

New website checklist:

1. Create the repo with `main` and `develop`, and set the default branch to `develop`.
2. Copy `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `.claude/settings.json`, `.github/dependabot.yml`, `.github/workflows/ci.yml`, `scripts/`, `.agents/skills/` and `skills-lock.json` from an existing site. Write a new `CONTEXT.md` and a `.env.example` in motchi-website's format: every variable the code reads, placeholders only, and where each is set (local, Preview, Production).
3. Import the repo into Vercel with the production branch set to `main`. Enable Web Analytics in the project's Analytics tab.
4. Create a Turnstile widget in Cloudflare for the production and preview hostnames. Set the two Turnstile variables in Vercel.
5. Add the privacy policy and the Motchi credit link.
6. Run `node scripts/dependency-inventory.mjs` and `node scripts/skill-inventory.mjs`.

## Writing style in files

- Use straight ASCII quotes (`'` and `"`), hyphens instead of en or em dashes, and `...` instead of the ellipsis character, unless a quote or data needs the original.
- Comments explain why, not what.

## Repository hygiene

- Keep docs few and useful: README.md (setup), CONTEXT.md (project rules for agents), docs/DEPENDENCIES.md, docs/SKILLS.md, and docs/AUDIT.md only for lasting findings.
- Do not add task reports, one-off audit files or decision logs. Before keeping a doc, ask: will someone need this in six months? If not, delete it or merge it into an existing doc.
- Do not commit build output, caches, archives, local plans, logs or OS files.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
