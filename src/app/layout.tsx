import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";

import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

const bodyFont = Anek_Latin({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Lai Catering | Custom tea & coffee menus in the GTA",
  description: "Premium tea and coffee catering with a custom drink menu for corporate, community, and private events across the GTA.",
  applicationName: "Lai Catering", manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f9f6f2", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={bodyFont.variable}><body>{children}<ServiceWorkerRegistration /></body></html>;
}
