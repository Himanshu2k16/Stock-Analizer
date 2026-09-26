import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { MarketProvider } from "@/modules/market";
import { AuthProvider } from "@/modules/auth";
import "./globals.css";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Meridian — Personal Market Desk",
  description:
    "Live NSE watchlists, technical scanners, portfolio analytics and price alerts. Decision support only — no broker execution.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${display.variable} ${sans.variable} ${mono.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        <AuthProvider>
          <MarketProvider>{children}</MarketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
