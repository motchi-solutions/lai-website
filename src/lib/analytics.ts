/* Vercel Web Analytics: cookie-free, anonymous page-view counts. Visitors are
   counted with a hash of the request that Vercel discards after 24 hours.
   https://vercel.com/docs/analytics/privacy-policy

   Runs only on Vercel Production (VERCEL_ENV is set by Vercel), so local
   development and previews send nothing. The privacy policy describes this;
   keep them in step. Shared Motchi standard: see AGENTS.md. */
export function analyticsEnabled(
    environment: string | undefined = process.env.VERCEL_ENV,
): boolean {
    return environment === "production";
}

/** Campaign tags kept so visits can be attributed to a link or campaign. */
export const campaignParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
] as const;

/** Keeps the page path and campaign tags only. Every other query parameter and
    the fragment are dropped because they can carry personal data. Tag values
    are capped at 64 characters. */
export function anonymousPageUrl(url: string): string {
    const parsed = new URL(url);
    const kept = new URLSearchParams();
    for (const key of campaignParams) {
        const value = parsed.searchParams.get(key)?.trim();
        if (value) kept.set(key, value.slice(0, 64));
    }
    const query = kept.toString();
    return `${parsed.origin}${parsed.pathname}${query ? `?${query}` : ""}`;
}
