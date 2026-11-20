#!/usr/bin/env node
// Regenerates docs/DEPENDENCIES.md: direct dependencies from lockfiles (npm, uv,
// Terraform), GitHub Actions pins, and an npm advisory audit.
// Purpose cells and everything below the "Notes" heading are kept between runs.
// Usage: node scripts/dependency-inventory.mjs [--no-audit]
// The audit contacts the npm registry; pass --no-audit to stay offline.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "docs", "DEPENDENCIES.md");
const runAudit = !process.argv.includes("--no-audit");
const skip = new Set([
    "node_modules",
    ".git",
    ".next",
    ".terraform",
    ".venv",
    "build",
    "dist",
    ".agents",
]);

function find(dir, name, depth = 3, found = []) {
    if (depth < 0) return found;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (skip.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) find(full, name, depth - 1, found);
        else if (entry.name === name) found.push(full);
    }
    return found;
}
const rel = (p) => path.relative(root, p) || ".";
const cell = (s) =>
    String(s ?? "")
        .replaceAll("|", "\\|")
        .replaceAll("\n", " ");

// Keep Purpose cells and the Notes section from the previous file.
const old = existsSync(outFile) ? readFileSync(outFile, "utf8") : "";
const purposes = new Map();
for (const line of old.split("\n")) {
    const m = line.match(/^\| `([^`]+)` \|.*\| ([^|]*) \|$/);
    if (m && m[2].trim() && !m[2].includes("TODO")) purposes.set(m[1], m[2].trim());
}
const notesAt = old.indexOf("\n## Notes");
const notes =
    notesAt >= 0
        ? old.slice(notesAt + 1).trimEnd()
        : "## Notes\n\nAdd lasting notes here. This section is kept when the file is regenerated.";
// Defaults for well-known packages; a Purpose written in the file wins.
const KNOWN = {
    "@vercel/analytics":
        "Vercel Web Analytics: cookie-free page views on Production only; query strings stripped except utm_* tags (src/lib/analytics.ts).",
    next: "App Router framework: routing, rendering, metadata, builds. Upgrade together with React and eslint-config-next.",
    react: "UI runtime. Keep the same version as react-dom.",
    "react-dom": "Browser rendering and hydration. Keep the same version as react.",
    typescript: "TypeScript 6 API alias used by ESLint and Next tooling (programmatic API).",
    "@typescript/native": "TypeScript 7 native compiler (`tsc`) for type checks.",
    "@types/react": "React types. Keep the major in step with React.",
    "@types/react-dom": "React DOM types. Keep the major in step with React.",
    "@types/node": "Node.js types for server code and tooling.",
    "@types/pdfkit": "Types for PDFKit.",
    tailwindcss: "Utility-first CSS framework (v4).",
    "@tailwindcss/postcss":
        "Tailwind v4 PostCSS plugin used by Next.js. Keep in step with tailwindcss.",
    postcss: "CSS processing pipeline used by Tailwind.",
    eslint: "Linter.",
    "eslint-config-next": "Next.js ESLint rules. Keep the same version as next.",
    "babel-plugin-react-compiler":
        "React Compiler (automatic memoization), enabled in next.config.",
    prettier: "Code formatter.",
    "react-icons": "Icon components (tree-shaken named imports).",
    "lucide-react": "Lucide icon components.",
    "hamburger-react": "Animated mobile menu toggle button.",
    zod: "Runtime schema validation for forms, API input and environment.",
    "qrcode.react": "Renders QR codes as SVG or canvas.",
    "framer-motion": "Animation library for React.",
    clsx: "Builds conditional className strings.",
    "tailwind-merge": "Merges Tailwind classes without conflicts (used with clsx).",
    "class-variance-authority": "Typed component style variants (shadcn/ui pattern).",
    "tw-animate-css": "Tailwind animation utilities used by shadcn/ui.",
    "radix-ui": "Accessible unstyled UI primitives (shadcn/ui base).",
    "@radix-ui/react-select": "Accessible select primitive.",
    shadcn: "shadcn/ui CLI for adding components. Dev-time tool.",
    "@supabase/supabase-js": "Supabase client: database, auth and storage.",
    "@supabase/ssr": "Supabase auth helpers for server rendering and cookies.",
    supabase: "Supabase CLI for local database and migrations. Dev-time tool.",
    vitest: "Unit test runner.",
    vite: "Frontend dev server and bundler.",
    "@vitejs/plugin-react": "React support for Vite.",
    oxlint: "Fast JavaScript/TypeScript linter.",
    swiper: "Touch slider and carousel.",
    "react-use": "Collection of React hooks.",
    "pdf-lib": "Creates and edits PDF files.",
    jspdf: "Generates PDF files in the browser.",
    "html-to-image": "Renders DOM nodes to images (used for PDF export).",
    "node-fetch": "fetch implementation for Node scripts.",
    "libphonenumber-js": "Phone number parsing, formatting and validation.",
    googleapis: "Google APIs client (Calendar, Sheets and others).",
    "@vercel/oidc": "Vercel OIDC tokens for keyless access to cloud APIs.",
    "@upstash/redis": "Serverless Redis client.",
    "@upstash/ratelimit": "Rate limiting backed by Upstash Redis.",
    "@notionhq/client": "Notion API client (CMS content).",
    "@tiptap/core": "Tiptap rich-text editor core.",
    "@tiptap/react": "Tiptap React bindings.",
    "@tiptap/pm": "ProseMirror packages used by Tiptap.",
    "@tiptap/starter-kit": "Tiptap basic editing extensions.",
    "@tiptap/extension-link": "Tiptap link support.",
    "@tiptap/extension-placeholder": "Tiptap placeholder text.",
    "@electric-sql/pglite": "In-process Postgres (WASM), typically for tests.",
    "email-validator": "Email address validation.",
    dotenv: "Loads .env files in scripts.",
    ruff: "Python linter and formatter.",
    pytest: "Python test runner.",
    alembic: "Database migrations for SQLAlchemy.",
    "actions/checkout": "Checks out the repository in CI.",
    "actions/setup-node": "Installs Node.js in CI (version from .nvmrc).",
    "actions/create-github-app-token": "Creates a short-lived GitHub App token in CI.",
    "aws-actions/configure-aws-credentials":
        "Gets short-lived AWS credentials through GitHub OIDC.",
    "hashicorp/setup-terraform": "Installs Terraform in CI.",
    "astral-sh/setup-uv": "Installs uv (Python) in CI.",
    "hashicorp/aws": "Terraform AWS provider.",
    "hashicorp/tfe": "Terraform provider for HCP Terraform workspaces and variables.",
};
const purpose = (name) => purposes.get(name) ?? KNOWN[name] ?? "TODO: describe";

const out = ["# Dependency tracker", ""];
const today = new Date().toISOString().slice(0, 10);
out.push(
    `Generated by \`node scripts/dependency-inventory.mjs\` on ${today}. Edit only the Purpose column and the Notes section; the rest is rebuilt from the lockfiles.`,
    "",
);
const audits = [];
const sections = [];

// npm
for (const lockPath of find(root, "package-lock.json")) {
    const dir = path.dirname(lockPath);
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    const top = lock.packages?.[""] ?? {};
    const rows = [];
    for (const [field, type] of [
        ["dependencies", "runtime"],
        ["devDependencies", "dev"],
        ["optionalDependencies", "optional"],
        ["peerDependencies", "peer"],
    ]) {
        for (const [name, range] of Object.entries(top[field] ?? {})) {
            const locked = lock.packages?.[`node_modules/${name}`]?.version ?? "not locked";
            rows.push(
                `| \`${name}\` | ${type} | \`${cell(range)}\` | \`${locked}\` | ${cell(purpose(name))} |`,
            );
        }
    }
    rows.sort();
    sections.push(
        `## npm: \`${rel(dir)}\``,
        "",
        `Node: ${existsSync(path.join(dir, ".nvmrc")) ? `\`${readFileSync(path.join(dir, ".nvmrc"), "utf8").trim()}\` (.nvmrc)` : top.engines?.node ? `\`${top.engines.node}\`` : "not pinned"}.`,
        "",
        "| Package | Type | Declared | Locked | Purpose |",
        "| --- | --- | --- | --- | --- |",
        ...rows,
        "",
    );
    if (runAudit) {
        let report;
        try {
            report = JSON.parse(
                execFileSync("npm", ["audit", "--json"], {
                    cwd: dir,
                    encoding: "utf8",
                    stdio: ["ignore", "pipe", "ignore"],
                    maxBuffer: 32 << 20,
                }),
            );
        } catch (e) {
            try {
                report = JSON.parse(e.stdout ?? "");
            } catch {
                /* reported below */
            }
        }
        const v = report?.metadata?.vulnerabilities;
        audits.push(
            v
                ? `| \`${rel(dir)}\` | npm audit | ${v.critical} | ${v.high} | ${v.moderate} | ${v.low} | ${Object.keys(report.vulnerabilities ?? {}).join(", ") || "-"} |`
                : `| \`${rel(dir)}\` | npm audit | ? | ? | ? | ? | audit failed to run |`,
        );
    }
}

// uv (Python)
for (const lockPath of find(root, "uv.lock")) {
    const dir = path.dirname(lockPath);
    const pyproject = existsSync(path.join(dir, "pyproject.toml"))
        ? readFileSync(path.join(dir, "pyproject.toml"), "utf8")
        : "";
    const locked = new Map();
    for (const m of readFileSync(lockPath, "utf8").matchAll(
        /\[\[package\]\]\nname = "([^"]+)"\nversion = "([^"]+)"/g,
    ))
        locked.set(m[1].toLowerCase(), m[2]);
    const rows = [];
    // Walk TOML tables: [project] dependencies, [dependency-groups] and
    // [project.optional-dependencies] keys are dependency lists.
    const blocks = [];
    let table = "";
    for (const m of pyproject.matchAll(/^\[([^\]]+)\]\s*$|^([\w-]+)\s*=\s*\[([^\]]*)\]/gm)) {
        if (m[1]) table = m[1].trim();
        else if (table === "project" && m[2] === "dependencies") blocks.push(["runtime", m[3]]);
        else if (table === "dependency-groups" || table === "project.optional-dependencies")
            blocks.push([m[2], m[3]]);
    }
    for (const [type, body] of blocks) {
        for (const [, spec] of body.matchAll(/"([^"]+)"/g)) {
            const name = spec.match(/^[A-Za-z0-9_.-]+/)?.[0];
            if (!name) continue;
            rows.push(
                `| \`${name}\` | ${type} | \`${cell(spec.slice(name.length).trim() || "*")}\` | \`${locked.get(name.toLowerCase().replaceAll("_", "-")) ?? locked.get(name.toLowerCase()) ?? "not locked"}\` | ${cell(purpose(name))} |`,
            );
        }
    }
    rows.sort();
    sections.push(
        `## Python (uv): \`${rel(dir)}\``,
        "",
        "| Package | Type | Declared | Locked | Purpose |",
        "| --- | --- | --- | --- | --- |",
        ...rows,
        "",
    );
    audits.push(
        `| \`${rel(dir)}\` | pip-audit (manual) | - | - | - | - | run \`uv export --locked --no-hashes > /tmp/req.txt && uvx pip-audit -r /tmp/req.txt\` |`,
    );
}

// Terraform providers
const providers = new Map();
for (const lockPath of find(root, ".terraform.lock.hcl", 4)) {
    for (const m of readFileSync(lockPath, "utf8").matchAll(
        /provider "([^"]+)" \{\s*\n\s*version\s*=\s*"([^"]+)"/g,
    )) {
        const name = m[1].replace("registry.terraform.io/", "");
        const entry = providers.get(name) ?? new Map();
        entry.set(m[2], [...(entry.get(m[2]) ?? []), rel(path.dirname(lockPath))]);
        providers.set(name, entry);
    }
}
if (providers.size) {
    sections.push(
        "## Terraform providers",
        "",
        "| Provider | Locked version: used in | Purpose |",
        "| --- | --- | --- |",
    );
    for (const [name, versions] of [...providers].sort())
        sections.push(
            `| \`${name}\` | ${[...versions].map(([v, dirs]) => `\`${v}\`: ${dirs.join(", ")}`).join("; ")} | ${cell(purpose(name))} |`,
        );
    sections.push("");
}

// GitHub Actions
const actions = new Map();
const wfDir = path.join(root, ".github", "workflows");
if (existsSync(wfDir)) {
    for (const file of readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f))) {
        for (const m of readFileSync(path.join(wfDir, file), "utf8").matchAll(
            /uses:\s*([^\s@#]+)@([^\s#]+)\s*(?:#\s*(\S+))?/g,
        )) {
            if (m[1].startsWith("./")) continue;
            const key = `${m[1]}@${m[2]}`;
            const entry = actions.get(key) ?? {
                name: m[1],
                ref: m[2],
                tag: m[3] ?? "",
                files: new Set(),
            };
            entry.files.add(file);
            actions.set(key, entry);
        }
    }
}
if (actions.size) {
    sections.push(
        "## GitHub Actions",
        "",
        "| Action | Version | Pinned to SHA | Workflows | Purpose |",
        "| --- | --- | --- | --- | --- |",
    );
    for (const a of [...actions.values()].sort((x, y) => x.name.localeCompare(y.name)))
        sections.push(
            `| \`${a.name}\` | ${a.tag || `\`${a.ref}\``} | ${/^[0-9a-f]{40}$/.test(a.ref) ? "yes" : "**no**"} | ${[...a.files].join(", ")} | ${cell(purpose(a.name))} |`,
        );
    sections.push("");
}

out.push("## Vulnerability audit", "");
if (!runAudit) out.push("Audit skipped (--no-audit).", "");
else if (!audits.length) out.push("No package lockfiles to audit.", "");
else
    out.push(
        "| Location | Tool | Critical | High | Moderate | Low | Affected packages |",
        "| --- | --- | --- | --- | --- | --- | --- |",
        ...audits,
        "",
    );
if (!sections.length)
    out.push(
        "No dependencies yet. Run this script again once a lockfile or workflow is added.",
        "",
    );
out.push(...sections, notes, "");
writeFileSync(outFile, out.join("\n"));
console.log(`Updated ${rel(outFile)}`);
