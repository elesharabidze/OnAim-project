import type { Config } from 'tailwindcss'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const COLORS = require('./src/styles/colors.ts').default

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // Disable Tailwind's base reset — MUI's CssBaseline owns that layer
    preflight: false,
  },
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      mobile: { max: '640px' },
      tablet: { max: '1023px' },
    },
    extend: {
      textColor: {
        default: COLORS.PRIMARY_TEXT,
        primary: COLORS.PRIMARY_TEXT,
        secondary: COLORS.SECONDARY_TEXT,
        accent: COLORS.PRIMARY,
        accent_light: COLORS.PRIMARY_LIGHT,
        primary_super_light: COLORS.PRIMARY_SUPER_LIGHT,
        primary_orange: COLORS.PRIMARY_ORANGE,
        primary_blue: COLORS.PRIMARY_BLUE,
      },
      backgroundColor: {
        default: COLORS.PRIMARY,
        primary: COLORS.PRIMARY,
        primary_light: COLORS.PRIMARY_LIGHT,
        primary_super_light: COLORS.PRIMARY_SUPER_LIGHT,
        secondary: COLORS.SECONDARY_BACKGROUND,
        dark: COLORS.DARK_BACKGROUND,
        primary_orange: COLORS.PRIMARY_ORANGE,
        primary_blue: COLORS.PRIMARY_BLUE,
      },
      borderColor: {
        default: COLORS.PRIMARY_BORDER,
        primary: COLORS.PRIMARY_BORDER,
        accent: COLORS.PRIMARY,
        accent_light: COLORS.PRIMARY_LIGHT,
        primary_super_light: COLORS.PRIMARY_SUPER_LIGHT,
        primary_orange: COLORS.PRIMARY_ORANGE,
        primary_blue: COLORS.PRIMARY_BLUE,
      },
      colors: {
        primary: COLORS.PRIMARY,
        primary_light: COLORS.PRIMARY_LIGHT,
        primary_super_light: COLORS.PRIMARY_SUPER_LIGHT,
        secondary: COLORS.SECONDARY,
        color_error: '#ff4d4f',
        color_success: '#52c41a',
        color_warning: '#faad14',
        primary_orange: COLORS.PRIMARY_ORANGE,
        primary_yellow: COLORS.PRIMARY_YELLOW,
        primary_blue: COLORS.PRIMARY_BLUE,
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        xxs: '0.625rem',  // 10px
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.75rem', // 28px
        '4xl': '2rem',    // 32px
      },
      fontWeight: {
        light: '300',
        base: '400',
        'semi-bold': '700',
        'extra-bold': '900',
      },
      maxWidth: {
        layout: '1248px',
      },
      boxShadow: {
        primary: '0px 8px 24px rgba(149, 157, 165, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
