/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        empire: {
          bg: '#0B0F1A',
          card: '#111827',
          border: '#1F2937',
          accent: '#C8A962',
          gold: '#D4AF37',
          emerald: '#10B981',
          ruby: '#EF4444',
          sapphire: '#3B82F6',
          amethyst: '#8B5CF6',
          text: '#E5E7EB',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
};
