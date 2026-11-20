/* Site identity. Shared Motchi standard (AGENTS.md, "Website standard"). */
export const site = {
    name: "Lai Project",
    /** Production origin. laiproject.org redirects here. */
    url: "https://www.laiproject.org",
    description:
        "Fresh, custom tea, matcha, coffee and refresher menus for events across the Greater Toronto Area.",
    locale: "en_CA",
} as const;

/* Site URLs and indexing. Shared Motchi standard (AGENTS.md, "Website standard").

   The production origin is set in site.url, so no environment variable is
   needed. SITE_URL (server-only, optional) overrides it, for example for
   another local port. Vercel sets VERCEL_ENV and VERCEL_BRANCH_URL. */

const localUrl = "http://localhost:3000";

/** This deployment's origin: SITE_URL if set, localhost in development, the
    branch URL on Vercel previews, otherwise the production origin. */
export function siteUrl(): string {
    const override = process.env.SITE_URL?.trim();
    if (override) return override.replace(/\/+$/, "");
    if (process.env.NODE_ENV === "development") return localUrl;
    const branchUrl = process.env.VERCEL_BRANCH_URL?.trim();
    if (process.env.VERCEL_ENV === "preview" && branchUrl) return `https://${branchUrl}`;
    return site.url;
}

/** Absolute URL on this deployment, for metadata, sitemaps, emails and redirects. */
export function absoluteUrl(path = "/"): string {
    return new URL(path, `${siteUrl()}/`).href;
}

/** Search engines may index Vercel Production only. Previews and local builds
    are served with noindex and a robots.txt that keeps crawlers out. */
export function indexingAllowed(): boolean {
    return process.env.VERCEL_ENV === "production";
}
