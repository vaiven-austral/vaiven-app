export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primario: "#49A078",
        secundario: "#216869",
        terciario: "#785964",
        tinta: "#111827",
        exito: "#2F7F5D",
        atencion: "#F59E0B",
        critico: "#DC2626",
        superficie: "#F9FAFB",
        tarjeta: "#FFFFFF",
        borde: "#EEF0F2",
        "borde-fuerte": "#E5E7EB",
        "texto-medio": "#6B7280",
        "texto-suave": "#9CA3AF",
        lienzo: "#F3F4F6",
        "terciario-claro": "#DAC6CD",
        "terciario-oscuro": "#3A2A31",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontWeight: {
        500: "500",
        600: "600",
        700: "700",
        800: "800",
      },
      borderRadius: {
        chip: "8px",
        boton: "14px",
        tarjeta: "20px",
        hoja: "28px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
}
