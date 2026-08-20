import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
    title: "Lai Catering | Custom tea & coffee menus in the GTA",
    description:
        "Premium tea and coffee catering with a custom drink menu for corporate, community, and private events across the GTA.",
    applicationName: "Lai Catering",
    manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f9f6f2", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://use.typekit.net/ibr0irn.css" />
            </head>
            <body>
                {children}
                <ServiceWorkerRegistration />
            </body>
        </html>
    );
}
