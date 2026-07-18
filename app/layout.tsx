import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cafe-folha-nagole.arjunbilla.chatgpt.site"),
  title: "Café Folha | Food, Folks & Good Nights in Nagole",
  description:
    "Café Folha in Nagole, Hyderabad—pizza, pasta, waffles, desserts, coffee and relaxed family dining, open daily until 11 PM.",
  openGraph: {
    title: "Café Folha — Food. Folks. Good Nights.",
    description: "Your neighbourhood table in Nagole, Hyderabad.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Café Folha in Nagole, Hyderabad" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Café Folha — Food. Folks. Good Nights.",
    description: "Your neighbourhood table in Nagole, Hyderabad.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
