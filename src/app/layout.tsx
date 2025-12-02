import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Impact Atlas | Climate Intelligence for Cities",
  description: "Discover your city's fastest, highest-impact climate and health wins. AI-powered platform revealing hotspots and quick wins across urban heat, air pollution, coastal plastic, port emissions, biodiversity and restoration.",
  keywords: ["climate", "sustainability", "AI", "cities", "urban planning", "environment", "urban heat", "air quality", "biodiversity"],
  openGraph: {
    title: "Impact Atlas | Climate Intelligence for Cities",
    description: "Discover your city's fastest, highest-impact climate and health wins.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-ink`}
      >
        {children}
      </body>
    </html>
  );
}
