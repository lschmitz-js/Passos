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
        cream: '#fdf8ec',
        cream2: '#f7e3bd',
        // Warm white. Pure #fff reads cold and slightly blue against the cream
        // ground; this keeps cards on the same temperature as the page.
        card: '#fffdf8',
        // Month trophies get their own accent so a trophy never reads as just a
        // bigger gold medal. Deep canopy green, borrowed from the zoo idea.
        canopy: '#2f6b4f',
        canopy2: '#40906a',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        // Tightened display scale -- the old jump from 20px to 36px had nothing
        // in between, which is why headings felt either timid or shouty.
        stat: ['28px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        statLg: ['40px', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        eyebrow: ['10px', { lineHeight: '1.2', letterSpacing: '0.12em' }],
      },
      boxShadow: {
        // Two-layer elevation: a tight contact shadow plus a soft ambient one,
        // both warm-tinted rather than neutral black.
        e1: '0 1px 2px rgba(44,24,16,0.05), 0 2px 8px rgba(44,24,16,0.05)',
        e2: '0 2px 4px rgba(44,24,16,0.06), 0 8px 20px rgba(44,24,16,0.08)',
        inset1: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        card: '0 2px 10px rgba(0, 0, 0, 0.06)',
        cardHover: '0 4px 14px rgba(0, 0, 0, 0.10)',
      },
      backgroundImage: {
        podium1: 'linear-gradient(135deg, #fff6d6 0%, #ffe9a8 100%)',
        podium2: 'linear-gradient(135deg, #f7f7fa 0%, #e7e7ee 100%)',
        podium3: 'linear-gradient(135deg, #fbeada 0%, #f2d3b4 100%)',
        trophy: 'linear-gradient(135deg, #e9f5ee 0%, #cfe8db 100%)',
      },
    },
  },
  plugins: [],
};
