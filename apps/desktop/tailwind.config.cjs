/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(39 39 42 / 0.9)",
        input: "rgb(24 24 27 / 0.75)",
        ring: "rgb(59 130 246)",
        background: "#09090b",
        foreground: "#fafafa",
        primary: {
          DEFAULT: "rgb(59 130 246)",
          foreground: "rgb(250 204 21)",
        },
        secondary: {
          DEFAULT: "rgb(250 204 21)",
          foreground: "rgb(9 9 11)",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgb(63 63 70)",
          foreground: "rgb(161 161 170)",
        },
        accent: {
          DEFAULT: "rgb(63 63 70)",
          foreground: "#fafafa",
        },
        card: {
          DEFAULT: "rgb(24 24 27)",
          foreground: "#fafafa",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
    },
  },
  plugins: [],
}
