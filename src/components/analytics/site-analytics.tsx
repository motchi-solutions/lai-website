"use client";

import { Analytics } from "@vercel/analytics/next";
import { anonymousPageUrl } from "@/lib/analytics";

/** Anonymous visitor statistics. Rendered only when analyticsEnabled(). */
export function SiteAnalytics() {
    return (
        <Analytics
            mode="production"
            beforeSend={(event) => ({ ...event, url: anonymousPageUrl(event.url) })}
        />
    );
}
