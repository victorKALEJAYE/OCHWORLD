import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // OCHWORLD brand
        gold: {
          100: "#FBEBC2",
          200: "#F8DE9C",
          300: "#F6D27A",
          400: "#E8BC4F",
          500: "#D7A328",
          600: "#B8871A",
          700: "#A9790F",
          800: "#7A5A0E",
        },
        ink: "#14110A",
        ember: { 400: "#F59E4B", 500: "#E8892B", 600: "#C96A12" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -24px, 0) scale(1.05)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(250%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(0.94)" },
        },
        "splash-out": {
          to: { opacity: "0", visibility: "hidden" },
        },
      },
      animation: {
        "float-slow": "float-slow 14s ease-in-out infinite",
        "float-slower": "float-slow 20s ease-in-out infinite reverse",
        "spin-slower": "spin 60s linear infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        shine: "shine 3.2s ease-in-out infinite",
        progress: "progress 1.4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
        "splash-out": "splash-out 0.4s ease 4s forwards",
      },
    },
  },
  plugins: [animate],
};

export default config;
