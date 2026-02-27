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
        background: "#0d1117",
        foreground: "#e6edf3",
        card: "#161b22",
        "card-foreground": "#e6edf3",
        primary: "#e6edf3",
        "primary-foreground": "#0d1117",
        secondary: "#161b22",
        "secondary-foreground": "#e6edf3",
        muted: "#161b22",
        "muted-foreground": "#8b949e",
        accent: "#4f8cff",
        "accent-foreground": "#e6edf3",
        destructive: "#ff4444",
        "destructive-foreground": "#e6edf3",
        border: "#2a3040",
        input: "#2a3040",
        ring: "#4f8cff",
        surface: "#161b22",
        "surface-hover": "#1c2129",
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
