/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "#2980b9",
        secondary: "var(--color-secondary)",
        "secondary-dark": "#1a252f",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        text: "var(--color-text)",
      },
      fontFamily: {
        sans: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
