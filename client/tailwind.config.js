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
        // PREMIUM DARK THEME PALETTE
        midnight: {
          950: '#020617', // Deepest Royal Blue/Black (Your existing background)
          900: '#0f172a', // Panel Background
          800: '#1e293b', // Lighter Panel
          700: '#334155', // Borders
        },
        gold: {
          300: '#FDE047', // Highlight
          400: '#FACC15', // Vibrant
          500: '#D4AF37', // METALLIC GOLD (Primary)
          600: '#B4912F', // Dark Gold
          700: '#927424', // Deep Gold
          glow: 'rgba(212, 175, 55, 0.5)',
        },
        royal: {
          500: '#2e3b55', // Muted Royal Blue
          600: '#1e293b', // Deep Royal
        }
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #D4AF37 0%, #B4912F 100%)",
        "gradient-royal": "radial-gradient(circle at center, #1e293b 0%, #020617 100%)",
        "mesh": "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)",
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    }
  },
  plugins: []
};
