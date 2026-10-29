import tailwindcssAnimate from "tailwindcss-animate"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens semánticos de shadcn/Base UI, mapeados a los valores del kit
        // (docs/ui/tokens.md) vía variables CSS en src/index.css. Los
        // componentes copiados de shadcn (Drawer, Sheet, etc.) usan estas
        // clases (bg-primary, border-border, etc.) tal cual vienen.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",

        // Tokens propios de VaiVen (docs/ui/tokens.md)
        primario: "#49A078",
        secundario: "#216869",
        terciario: {
          DEFAULT: "#785964",
          100: "#EDE3E6",
          200: "#DAC6CD",
          700: "#4E3841",
          800: "#3A2A31",
        },
        tinta: "#111827",
        exito: "#2F7F5D",
        atencion: "#F59E0B",
        "atencion-texto": "#92620A",
        critico: "#DC2626",
        superficie: "#F9FAFB",
        tarjeta: "#FFFFFF",
        borde: "#EEF0F2",
        "borde-fuerte": "#E5E7EB",
        "texto-medio": "#6B7280",
        "texto-suave": "#9CA3AF",
        lienzo: "#F3F4F6",
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
  plugins: [tailwindcssAnimate],
}
