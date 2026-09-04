/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1A3A6B",
          foreground: "#FFFFFF",
          50:  '#F0F4FA',
          100: '#E8EEF7',
          200: '#C5D5EC',
          300: '#94B3DA',
          500: '#2E5EA8',
          700: '#1A3A6B',
          900: '#0C1D3A',
        },
        accent: {
          DEFAULT: "#0D7377",
          foreground: "#FFFFFF",
          50:  '#E6F5F5',
          100: '#CCE9E9',
          400: '#2AA5A9',
          600: '#0D7377',
        },
        neutral: {
          0:   '#FFFFFF',
          100: '#F5F5F5',
          200: '#E5E5E5',
          400: '#A3A3A3',
          700: '#404040',
          950: '#0A0A0A',
        },
        success: {
          DEFAULT: '#15803D',
          50:  '#F0FDF4',
          700: '#15803D',
        },
        warning: {
          DEFAULT: '#CA8A04',
          50:  '#FEFCE8',
          600: '#CA8A04',
        },
        error: {
          DEFAULT: '#DC2626',
          50:  '#FEF2F2',
          600: '#DC2626',
        },
        info: {
          DEFAULT: '#2563EB',
          50:  '#EFF6FF',
          600: '#2563EB',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        container: '1120px',
        'form-narrow': '560px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
