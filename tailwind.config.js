/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Gutcheck.AI Brand Colors
        'gutcheck': {
          'deep-navy': '#0A1F44',
          'electric-blue': '#147AFF',
          'vibrant-teal': '#19C2A0',
          'bright-orange': '#FF6B00',
          'bright-yellow': '#FFC700',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
