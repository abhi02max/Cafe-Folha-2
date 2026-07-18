import type { Metadata, Viewport } from "next";
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
  keywords: [
    "Cafe Folha",
    "cafe in Nagole",
    "restaurants in Nagole",
    "family restaurant Hyderabad",
    "pizza Nagole",
    "biryani Nagole",
    "waffles Hyderabad",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
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

export const viewport: Viewport = {
  themeColor: "#07191f",
  colorScheme: "dark light",
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Café Folha",
  image: "https://cafe-folha-nagole.arjunbilla.chatgpt.site/og.png",
  url: "https://cafe-folha-nagole.arjunbilla.chatgpt.site",
  telephone: "+91 91211 39238",
  priceRange: "₹200–400",
  servesCuisine: ["Indian", "Pizza", "Pasta", "Cafe", "Desserts"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "12/1/570, 1st Floor, Lalitha Nagar, Bandlaguda Road",
    addressLocality: "Nagole",
    addressRegion: "Telangana",
    postalCode: "500068",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 17.3707192,
    longitude: 78.5715935,
  },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "11:00",
    closes: "23:00",
  }],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "73",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
