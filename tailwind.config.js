/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Using class strategy for potential manual toggle
  theme: {
    extend: {
      colors: {
        // Core Palette
        'brand-dark': '#0F0F0F', // Near black for primary background
        'brand-surface': '#1A1A1A', // Slightly lighter for cards/surfaces
        'brand-primary': '#8A4FFF', // Vibrant Purple
        'brand-secondary': '#FF4F8A', // Vibrant Pink/Red
        'brand-accent': '#4FEFFF', // Vibrant Cyan/Blue

        // Text Palette
        'text-primary': '#F5F5F7', // Off-white for main text
        'text-secondary': '#A0AEC0', // Gray for muted text
        'text-tertiary': '#718096', // Darker gray

        // Gradient Stops (Examples - adjust as needed)
        'grad-purple-from': '#8A4FFF',
        'grad-purple-to': '#C64FFF',
        'grad-red-from': '#FF4F8A',
        'grad-red-to': '#FF8C4F',
        'grad-blue-from': '#4FEFFF',
        'grad-blue-to': '#4FAFFF',

        // Border/Outline
        'border-color': '#3A3A3A', // Subtle border color
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(var(--glow-color), 0.5)',
        'glow-md': '0 0 15px rgba(var(--glow-color), 0.6)',
        'glow-lg': '0 0 25px rgba(var(--glow-color), 0.7)',
        'card': '0 4px 15px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'gradient-pulse': 'gradientPulse 4s ease infinite',
        'border-glow': 'borderGlow 1.5s ease-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientPulse: { // For subtle background gradient shifts
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        borderGlow: { // For glowing border effect
           '0%': { boxShadow: '0 0 5px 0px rgba(var(--glow-color), 0.5)' },
           '100%': { boxShadow: '0 0 15px 3px rgba(var(--glow-color), 0.7)' },
        }
      },
      backgroundImage: { // Helper for gradient borders
        'gradient-outline': 'linear-gradient(var(--gradient-angle, 90deg), var(--gradient-from), var(--gradient-to))',
      },
      transitionTimingFunction: {
        'custom-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Plugin for gradient borders (optional, can be done with CSS)
    function ({ addUtilities, theme, e }) {
      const gradients = theme('backgroundImage');
      const utilities = Object.keys(gradients).map((key) => ({
        [`.border-gradient-${e(key)}`]: {
          border: '2px solid transparent', // Adjust border width as needed
          background: `linear-gradient(${theme('colors.brand-surface', '#1A1A1A')}, ${theme('colors.brand-surface', '#1A1A1A')}) padding-box, ${gradients[key]} border-box`,
        },
      }));
      addUtilities(utilities, ['responsive', 'hover']);
    },
  ],
}
