/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDeep: "#0b0020",
        textBright: "#f3f6ff",
        textDim: "#b9b9d0",
        neonPink: "#ff007f",
        neonBlue: "#00ccff",
        neonPurple: "#aa00ff",
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
