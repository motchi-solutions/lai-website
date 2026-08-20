import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Lai Catering", short_name: "Lai", description: "Custom tea and coffee catering for events in the GTA.", start_url: "/", display: "standalone", background_color: "#f9f6f2", theme_color: "#f9f6f2", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }] };
}
