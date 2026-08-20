import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Lai Catering | Tea, Matcha & Coffee Catering in the GTA",
        template: "%s | Lai Catering",
    },
    description:
        "Planning an event in the GTA? Lai Catering creates fresh tea, matcha and coffee menus around your guests, theme and budget—so every cup feels considered.",
    applicationName: "Lai Catering",
    appleWebApp: { capable: true, title: "Lai Catering", statusBarStyle: "default" },
    authors: [{ name: "Lai Catering" }],
    creator: "Lai Catering",
    publisher: "Lai Catering",
    keywords: [
        "tea catering Toronto",
        "coffee catering Toronto",
        "matcha catering GTA",
        "mobile beverage catering",
        "corporate event catering Toronto",
        "custom drink menu",
    ],
    alternates: { canonical: "/" },
    category: "Food & Drink",
    openGraph: {
        type: "website",
        locale: "en_CA",
        url: "/",
        siteName: "Lai Catering",
        title: "Lai Catering | Tea, Matcha & Coffee Catering in the GTA",
        description:
            "Fresh, custom drink menus made around your guests, theme and budget for events across the GTA.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Lai Catering | Tea, Matcha & Coffee Catering in the GTA",
        description:
            "Fresh, custom drink menus made around your guests, theme and budget for events across the GTA.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f9f6f2", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Lai Catering",
        url: siteUrl,
        logo: `${siteUrl}/brand/lai-logo.png`,
        image: `${siteUrl}/opengraph-image.png`,
        description:
            "Fresh, custom tea, matcha, coffee and refresher menus for events across the Greater Toronto Area.",
        areaServed: { "@type": "AdministrativeArea", name: "Greater Toronto Area" },
        knowsAbout: [
            "Tea catering",
            "Matcha catering",
            "Coffee catering",
            "Custom event drink menus",
        ],
    };

    return (
        <html
            lang="en"
            className="scroll-smooth scroll-pt-[calc(var(--header-height)+0.25rem)] motion-reduce:scroll-auto"
        >
            <head>
                <meta name="apple-mobile-web-app-title" content="Lai Catering" />
                <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://use.typekit.net/ibr0irn.css" />
            </head>
            <body className="m-0 overflow-x-clip bg-paper font-body text-base leading-normal text-ink sm:text-lg [&_*:focus-visible]:outline-3 [&_*:focus-visible]:outline-focus [&_*:focus-visible]:outline-offset-4">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
                    }}
                />
                <Navbar />
                <div className="mx-auto min-h-[calc(100svh-var(--header-height))] w-full max-w-7xl">
                    {children}
                </div>
                <Footer />
                <ServiceWorkerRegistration />
            </body>
        </html>
    );
}
