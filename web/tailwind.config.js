/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Garante que Tailwind funcione em todos os arquivos
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        urbanist: ['Urbanist', 'sans-serif'],
        gantari: ['Gantari', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-to-top': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        'slide-out-to-bottom': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.3s ease-in-out',
        'slide-in-top': 'slide-in-from-top 0.3s ease-in-out',
        'slide-in-bottom': 'slide-in-from-bottom 0.3s ease-in-out',
        'slide-out-top': 'slide-out-to-top 0.3s ease-in-out',
        'slide-out-bottom': 'slide-out-to-bottom 0.3s ease-in-out'
      }
      
    },
     fontFamily: { // Defina a fonte global aqui
      'sans': ['Inter', 'sans-serif'], // 'sans' é a categoria padrão para fontes sem serifa
      'urbanist': ['Urbanist', 'sans-serif'], // Mantendo as outras definições
      'gantari': ['Gantari', 'sans-serif'],
    },
  },
  plugins: [],
};