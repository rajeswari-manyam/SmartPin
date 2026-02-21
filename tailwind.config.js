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
          DEFAULT: "#00598a",  // Main brand color
          light: "#00598a",    // Lighter shade for hover effects
          dark: "#003a5c",     // Darker shade for pressed states
          50: "#e6f0f5",
          100: "#cce1eb",
          200: "#99c3d7",
          300: "#66a5c3",
          400: "#3387af",
          500: "#00598a",
          600: "#00598a",      // Main
          700: "#00598a",
          800: "#00598a",
          900: "#00598a",
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
