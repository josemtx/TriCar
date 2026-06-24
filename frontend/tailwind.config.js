/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ============================================================
      // 1. FAMILIA DE FUENTES (SF Pro en Apple, Helvetica en otros)
      // ============================================================
      // Tu guía: "Helvetica o SF Pro (`font-sans`). Limpia, atemporal"
      fontFamily: {
        sans: [
          'Inter',                        // Tipografía premium vía Google Fonts (clon SF Pro/Helvetica)
          'system-ui',                    // Sistema del dispositivo
          '-apple-system',                // Fuerza SF Pro en Apple devices
          'BlinkMacSystemFont',           // Safari en Mac/iOS (SF Pro)
          '"Segoe UI"',                   // Windows
          'Roboto',                       // Android
          '"Helvetica Neue"',             // Fallback a Helvetica
          'Helvetica',                    // Fallback a Helvetica
          'Arial',                        // Fallback
          'sans-serif'                    // Ultimate fallback
        ],
      },

      // ============================================================
      // 2. ANIMACIONES PERSONALIZADAS
      // ============================================================
      // Tu guía: SorteoRuleta debe tener brillo pulsante (animate-sorteo-glow)
      animation: {
        'sorteo-glow': 'sorteo-glow 2s ease-in-out infinite',
      },

      keyframes: {
        'sorteo-glow': {
          '0%, 100%': {
            borderColor: 'rgba(99, 102, 241, 0.4)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)',
          },
          '50%': {
            borderColor: 'rgba(99, 102, 241, 0.8)',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
          },
        },
      },

      // ============================================================
      // NOTAS SOBRE LO QUE YA ESTÁ EN TAILWIND POR DEFECTO:
      // ============================================================
      // ✅ Colores: indigo-500, indigo-600, emerald-400, orange-500, red-500, etc.
      // ✅ Espaciado: px-4, px-5, space-y-3, space-y-4, space-y-6, etc.
      // ✅ Redondeado: rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, etc.
      // ✅ Transiciones: transition-all, duration-200, duration-300, etc.
      // ✅ Sombras: shadow-lg, shadow-black/20, etc.
      // ✅ Tipografía: text-xs, text-sm, text-base, text-lg, text-2xl, font-bold, etc.
      // ✅ Efecto glass: backdrop-blur-md, etc.
      //
      // Tailwind ya cubre TODO lo que especificaste en tu guía.
      // No necesitas agregar más aquí.
    },
  },
  plugins: [],
};