import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Café Folha Nagole",
    short_name: "Café Folha",
    description: "Menu, reservations, orders, events and Folha Passport.",
    start_url: "/",
    display: "standalone",
    background_color: "#07191f",
    theme_color: "#07191f",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
