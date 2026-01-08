/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        colors: {
          primary: "#0B1120",   // Deep Navy / Almost Black (Pro Text)
          secondary: "#1E293B", // Slate 800 (Secondary Text)
          accent: "#2563EB",    // Electric Blue (Buttons/Highlights)
          "legal-blue": "#172554", // Deepest Blue (Backgrounds if needed)
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      }
    }
  },
  plugins: []
};
