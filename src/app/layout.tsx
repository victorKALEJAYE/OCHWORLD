import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/brand/splash-screen";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OCHWORLD — Live Abuja",
    template: "%s · OCHWORLD",
  },
  description:
    "Buy, rent or book verified homes across Abuja, compare districts by security, power and water, and close safely with property lawyers.",
  icons: { icon: "/ochworld-mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#0B0A08",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh font-sans">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
