/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#495356',    
        secondary: '#111827',  
        accent: '#656469',     
        background: '#0a0a0b',
        foreground: '#e0e2e4',
        // Add these new colors
        card: '#1a1a1c',
        border: '#2a2a2d',
        success: '#10b981',
      },
      fontFamily: {
        roboto: ['var(--font-roboto)', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.25em',
      },
      animation: {
        gradient: 'gradient 6s ease infinite',
        'tracer-glow': 'tracer-glow 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'tracer-glow': {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(170, 60, 146, 0.3), 0 0 20px rgba(17, 30, 125, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(170, 60, 146, 0.5), 0 0 30px rgba(17, 30, 125, 0.3)',
          },
        },
      },
    },
  },
  plugins: [],
}