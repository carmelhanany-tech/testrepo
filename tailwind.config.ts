import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
      colors: {
        bg: "#F5F0EB",
        surface: "#FFFFFF",
        "surface-warm": "#FAF7F4",
        "surface-subtle": "#F0EBE4",
        border: "#E2D9CE",
        "text-primary": "#1C2B3A",
        "text-secondary": "#5A6B7D",
        "text-muted": "#9AABB8",
        accent: "#D4845A",
        "accent-dark": "#B86D42",
        "accent-light": "#F5E6DC",
        success: "#6B8F71",
        "success-light": "#EAF2EB",
        locked: "#C5CBD3",
      },
    },
  },
  plugins: [],
} satisfies Config;
