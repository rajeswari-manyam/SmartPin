/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors - Change these to update your theme
        primary: {
          DEFAULT: "#f09b13",  // Main brand color
          light: "#f09b13",    // Lighter shade for hover effects
          dark: "#f09b13",     // Darker shade for pressed states
          50: "#f09b13",
          100: "#f09b13",
          200: "#f09b13",
          300: "#f09b13",
          400: "#f09b13",
          500: "#f09b13",
          600: "#f09b13",      // Main
          700: "#f09b13",
          800: "#f09b13",
          900: "#f09b13",
        },
        // Secondary/Background colors
        secondary: {
          DEFAULT: "#F0F0F0",  // Secondary background
          light: "#F8F8F8",    // Lighter background
          dark: "#E0E0E0",     // Darker background
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#F0F0F0",      // Main
          300: "#E0E0E0",
          400: "#D1D5DB",
          500: "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
}
