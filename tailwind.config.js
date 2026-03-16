/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        empire: {
          bg: 'var(--bg)',
          'bg-soft': 'var(--bg-soft)',
          card: 'var(--card)',
          'card-hover': 'var(--card-hover)',
          border: 'var(--border)',
          accent: 'var(--accent)',
          gold: 'var(--gold)',
          emerald: '#10B981',
          ruby: '#EF4444',
          sapphire: '#3B82F6',
          amethyst: '#8B5CF6',
          text: 'var(--text)',
          'text-secondary': 'var(--text-secondary)',
          muted: 'var(--muted)',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
