import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f14",
        foreground: "#e6edf3",
        card: "#12171d",
        "card-foreground": "#e6edf3",
        primary: "#e6edf3",
        "primary-foreground": "#0b0f14",
        secondary: "#12171d",
        "secondary-foreground": "#e6edf3",
        muted: "#12171d",
        "muted-foreground": "#9aa4b2",
        accent: "#4f8cff",
        "accent-foreground": "#e6edf3",
        destructive: "#ff4444",
        "destructive-foreground": "#e6edf3",
        border: "#1c2430",
        input: "#1c2430",
        ring: "#4f8cff",
        surface: "#12171d",
        "surface-hover": "#161c23",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
