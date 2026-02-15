/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        midnight: {
          900: '#0f172a', // Slate 900 (Lighter Background)
          800: '#151e32', // Panel Backgrounds
          700: '#2a3b55', // Borders/Separators
        },
        charcoal: {
          900: '#0f172a', // Primary Text
          800: '#1e293b', // Secondary Text
          600: '#475569', // Muted Text
        },
        gold: {
          400: '#fbbf24', // Amber 400 (Brightest)
          500: '#f59e0b', // Amber 500 (Primary Gold)
          600: '#d97706', // Amber 600 (Darker Gold)
          dim: 'rgba(245, 158, 11, 0.1)', // Gold Tint
        },
        bronze: {
          500: '#78350f', // Deep Bronze
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh": "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)",
      }
    }
  },
  plugins: []
};
