import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { InitialLoader } from "@/components/brand/initial-loader";
import { siteConfig } from "@/config/site";
import { INITIAL_LOADER_SEEN_KEY } from "@/lib/initial-loader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({
  subsets: ["latin"],
  // 300 + italic for the editorial display headline (components/brand/display-heading.tsx).
  weight: ["300", "400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: "/ochworld-mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script may add data-initial-loader before React loads.
    <html lang="en-NG" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint: skip the first-visit loader if it was already shown this session. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("${INITIAL_LOADER_SEEN_KEY}"))document.documentElement.dataset.initialLoader="skip"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh font-sans">
        <InitialLoader />
        {children}
      </body>
    </html>
  );
}
