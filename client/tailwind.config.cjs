module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        display: ["Fraunces", "ui-serif", "Georgia"]
      },
      colors: {
        ink: "#0b0b0b",
        clay: "#f5eee6",
        berry: "#8b2d2d",
        moss: "#2d5b4b",
        sand: "#f3d9b1"
      },
      boxShadow: {
        soft: "0 12px 30px -12px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};
