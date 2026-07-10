/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bgDeep: "#080910",
        card: "#111827",
        accent: "#ffc400",
        textBright: "#f4f7fb",
        textDim: "#aab4c8",
        neonPink: "#ff2d7a",
        neonBlue: "#00c8ff",
        neonPurple: "#8f5cff",
        neonYellow: "#ffc400",
      },
      fontFamily: {
        hero: ["Orbitron", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
