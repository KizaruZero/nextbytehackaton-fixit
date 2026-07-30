/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FFFDF6',
        ink: '#111111',
        primary: '#4D61FC',
        accent: '#FFDE59',
        danger: '#FF3D3D',
        success: '#3DFFA2',
      },
      boxShadow: {
        brutal: '4px 4px 0px #111111',
        'brutal-sm': '2px 2px 0px #111111',
        'brutal-lg': '6px 6px 0px #111111',
        'brutal-hover': '6px 6px 0px #111111',
        'brutal-primary': '4px 4px 0px #2D41DC',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
