import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopNav } from "@/components/top-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const HOME_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [SITE_AUTHOR],
  creator: SITE_AUTHOR.name,
  publisher: SITE_AUTHOR.name,
  applicationName: SITE_NAME,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0805" },
    { media: "(prefers-color-scheme: light)", color: "#0a0805" },
  ],
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
    },
    {
      "@type": "TechArticle",
      "@id": `${SITE_URL}/#article`,
      headline: "Holographic Reduced Representations",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      inLanguage: "en-US",
      author: { "@id": `${SITE_URL}/#person` },
      about: [
        "Holographic Reduced Representations",
        "Vector symbolic architectures",
        "Structured vector memory",
      ],
      keywords: SITE_KEYWORDS.join(", "),
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          Skip to main content
        </a>
        <Providers>
          <TopNav />
          <main id="main" className="pt-16">
            {children}
          </main>
          <SiteFooter />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
