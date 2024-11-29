import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Libre_Baskerville,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: "variable",
  style: ["italic", "normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
  fallback: ["Inter", "Helvetica"],
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["italic", "normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre-baskerville",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  style: ["italic", "normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "ying's ar puzzle",
  description: "a puzzle for ying <3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="icon"
        type="image/png"
        href="/favicon-48x48.png"
        sizes="48x48"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <meta name="apple-mobile-web-app-title" content="alexiswei" />
      <link rel="manifest" href="/site.webmanifest" />
      <body
        className={`${plusJakartaSans.variable} ${libreBaskerville.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
