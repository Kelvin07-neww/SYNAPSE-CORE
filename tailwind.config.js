/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: { 950: "#020617", 900: "#030712", 800: "#0f172a" } },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "marquee-reverse": { "0%": { transform: "translateX(-50%)" }, "100%": { transform: "translateX(0)" } },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(30px,-40px,0)" },
        },
        twinkle: { "0%,100%": { opacity: 0.15 }, "50%": { opacity: 0.7 } },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marquee-reverse 45s linear infinite",
        drift: "drift 14s ease-in-out infinite",
        twinkle: "twinkle 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
