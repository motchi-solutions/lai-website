import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";

/* Link-preview fetchers for messaging and social apps. They draw link cards
   from Open Graph tags and do not index, so they may fetch preview builds. */
const linkPreviewAgents = [
    "Twitterbot",
    "facebookexternalhit",
    "LinkedInBot",
    "Slackbot",
    "Discordbot",
    "WhatsApp",
    "TelegramBot",
];

/** Paths crawlers never need: APIs and private or signed-in pages. */
const privatePaths: string[] = ["/api/"];

/* Production may be crawled; previews and local builds keep search engines out. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: indexingAllowed()
            ? { userAgent: "*", allow: "/", disallow: privatePaths }
            : [
                  { userAgent: linkPreviewAgents, allow: "/", disallow: privatePaths },
                  { userAgent: "*", disallow: "/" },
              ],
        sitemap: absoluteUrl("/sitemap.xml"),
    };
}
