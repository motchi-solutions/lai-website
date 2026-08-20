import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Lai Catering",
        short_name: "Lai",
        description: "Fresh, custom tea, matcha and coffee menus for events across the GTA.",
        id: "/",
        start_url: "/",
        scope: "/",
        lang: "en-CA",
        display: "standalone",
        background_color: "#f9f6f2",
        theme_color: "#f9f6f2",
        categories: ["food", "lifestyle"],
        icons: [
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
