import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * OCHWORLD design tokens.
 *
 * Brand colours are measured from the original logo artwork (gold mark on black)
 * and must not be extended with extra shades. Tints are made with opacity
 * (e.g. `bg-primary/10`), never with new hex values. See docs/design-system.md.
 *
 * Every other colour is a semantic CSS variable defined in globals.css for the
 * light theme (default) and the dark theme (`.dark` on any wrapper).
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        brand: {
          gold: "#C38C25",
          black: "#000000",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Two elevations only: resting cards and floating layers (menus, popovers).
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        elevated: "0 12px 32px -12px rgb(0 0 0 / 0.25)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  // tailwindcss-animate is kept for shadcn overlays (dialogs, menus) added in later phases.
  plugins: [animate],
};

export default config;
