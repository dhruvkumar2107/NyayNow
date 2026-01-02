/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",   // slate-900
        accent: "#6366f1"     // indigo-500
      }
    }
  },
  plugins: []
};
