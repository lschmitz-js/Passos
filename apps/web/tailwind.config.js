/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2c1810',
        muted: '#6b5340',
        muted2: '#8b7460',
        muted3: '#b0a090',
        muted4: '#c4b8a8',
        gold: '#d4a017',
        gold2: '#f0c040',
        silver: '#b8b8c0',
        bronze: '#c08850',
        cream: '#fef9e7',
        cream2: '#fce4b6',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(0, 0, 0, 0.06)',
        cardHover: '0 4px 14px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
};
