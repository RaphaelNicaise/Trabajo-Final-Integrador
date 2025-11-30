/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados según docs.frontend.md
        primary: {
          DEFAULT: '#6366F1', // Tech Indigo
          hover: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#1E1B4B', // Midnight Blue
        },
        accent: {
          DEFAULT: '#10B981', // Growth Emerald
          hover: '#059669',
        },
        background: {
          DEFAULT: '#F8FAFC', // Clean Slate
        },
        text: {
          main: '#1E293B', // Texto principal
          secondary: '#64748B', // Texto secundario
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Escala de tamaños según docs.frontend.md
        'h1': ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'modal': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}

