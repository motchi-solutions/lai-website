import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";
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
        <html
            lang="en"
            className="scroll-smooth scroll-pt-[calc(var(--header-height)+0.25rem)] motion-reduce:scroll-auto"
        >
            <head>
                <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://use.typekit.net/ibr0irn.css" />
            </head>
            <body className="m-0 overflow-x-clip bg-paper font-body text-base leading-normal text-ink sm:text-lg [&_*:focus-visible]:outline-3 [&_*:focus-visible]:outline-focus [&_*:focus-visible]:outline-offset-4">
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
