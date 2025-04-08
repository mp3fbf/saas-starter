/**
 * @description
 * Tailwind CSS configuration file for the Palavra Viva application.
 * Extends the default Tailwind theme with custom colors, fonts, etc.,
 * primarily using CSS variables defined in `globals.css` for theming.
 * Configures Tailwind plugins like typography, forms, and aspect-ratio.
 *
 * @notes
 * - This configuration uses CSS variables (--color-*) for theme colors,
 *   allowing dynamic theme switching (light/dark/custom).
 * - The `colors` object maps friendly names (like 'primary', 'secondary')
 *   to these CSS variables.
 * - Includes the `tailwindcss-animate` plugin for animations.
 * - Manrope font is applied globally via `app/layout.tsx`.
 */
import type { Config } from 'tailwindcss';

const config = {
  darkMode: 'class', // Enable dark mode based on the 'dark' class on the html/body tag
  content: [
    './pages/**/*.{ts,tsx}', // Include pages directory (if any)
    './components/**/*.{ts,tsx}', // Include shared components
    './app/**/*.{ts,tsx}', // Include app directory components and pages
    './src/**/*.{ts,tsx}', // Include src directory (if used)
  ],
  prefix: '', // No prefix for Tailwind classes
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Map theme colors to CSS variables defined in globals.css
      colors: {
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive))',
          foreground: 'hsl(var(--color-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          foreground: 'hsl(var(--color-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--color-popover))',
          foreground: 'hsl(var(--color-popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--color-card))',
          foreground: 'hsl(var(--color-card-foreground))',
        },
      },
      // Extend border radius based on CSS variables
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      // Define keyframe animations (used by tailwindcss-animate)
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      // Define animation utilities
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  // Include the tailwindcss-animate plugin
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;