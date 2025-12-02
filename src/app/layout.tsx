import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#14B8A6",
          colorBackground: "#0A0F1A",
          colorInputBackground: "#111827",
          colorInputText: "#F9FAFB",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-gradient-to-r from-teal-500 to-cyan-400 hover:opacity-90",
          card: "bg-[#111827] border border-[#1F2937]",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton:
            "bg-[#1F2937] border-[#374151] hover:bg-[#374151]",
          formFieldLabel: "text-gray-300",
          formFieldInput: "bg-[#1F2937] border-[#374151] text-white",
          footerActionLink: "text-teal-400 hover:text-teal-300",
        },
      }}
    >
      <html lang="en" className="scroll-smooth">
        <body
          className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-ink`}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
