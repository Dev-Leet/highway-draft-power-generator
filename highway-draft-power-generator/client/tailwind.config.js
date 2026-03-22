/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060b16",
          900: "#0a1120",
          800: "#0d1830",
          700: "#112040",
        },
        cyan: { 400: "#22d3ee", 500: "#06b6d4" },
        green: { 400: "#4ade80", 500: "#22c55e" },
      },
    },
  },
  plugins: [],
};
