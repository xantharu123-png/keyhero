/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hero: ["Orbitron", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        bgDeep: "#0b0020", // sehr dunkles Violett
        neonPink: "#ff007f",
        neonBlue: "#00ccff",
        neonPurple: "#aa00ff",
        neonYellow: "#ffc400",
        cardBg: "rgba(20,0,40,0.6)",
        cardBorder: "rgba(255,0,150,0.4)",
        textDim: "#c7a3ff",
        textBright: "#fff",
      },
      boxShadow: {
        neonPink: "0 0 10px rgba(255,0,127,0.8), 0 0 30px rgba(255,0,127,0.4)",
        neonBlue: "0 0 10px rgba(0,204,255,0.8), 0 0 30px rgba(0,204,255,0.4)",
        neonPurple:
          "0 0 10px rgba(170,0,255,0.8), 0 0 30px rgba(170,0,255,0.4)",
      },
      backgroundImage: {
        synthSun:
          "radial-gradient(circle at 50% 30%, rgba(255,196,0,0.8) 0%, rgba(255,0,127,0) 70%)",
        synthGrad:
          "linear-gradient(160deg,#2b0057 0%,#100026 40%,#000010 80%)",
        cardGrad:
          "linear-gradient(140deg,rgba(255,0,127,0.15) 0%,rgba(0,204,255,0.07) 100%)",
        btnGrad:
          "linear-gradient(90deg,#ff007f 0%,#aa00ff 50%,#00ccff 100%)",
      },
    },
  },
  plugins: [],
};
