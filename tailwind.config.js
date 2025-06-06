const plugin = require("tailwindcss/plugin");
const svgToDataUri = require("mini-svg-data-uri");

// Safe flattening utility to replace deprecated flattenColorPalette
function flattenColors(colors, prefix = "") {
  return Object.entries(colors).flatMap(([key, value]) => {
    if (typeof value === "string") {
      return [[prefix + key, value]];
    }
    return flattenColors(value, `${prefix + key}-`);
  });
}

// Plugin to add CSS variables for each Tailwind color
const addVariablesForColors = plugin(function ({ addBase, theme }) {
  const colors = theme("colors");
  const flattened = Object.fromEntries(flattenColors(colors));
  const cssVars = Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [`--${key}`, value])
  );

  addBase({
    ":root": cssVars,
  });
});

// Plugin to generate dot background utility using Tailwind colors
const generateDotUtilities = plugin(function ({ matchUtilities, theme }) {
  const colors = Object.fromEntries(flattenColors(theme("backgroundColor")));

  matchUtilities(
    {
      "bg-dot-thick": (value) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
        )}")`,
      }),
    },
    { values: colors, type: "color" }
  );
});

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        input: `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        grid: "grid 15s linear infinite",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        slide: "slide var(--speed) ease-in-out infinite alternate",
        meteor: "meteor 5s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        backgroundPositionSpin: "background-position-spin 3000ms infinite alternate",
      },
      keyframes: {
        "background-position-spin": {
          "0%": { backgroundPosition: "top center" },
          "100%": { backgroundPosition: "bottom center" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },
        slide: {
          to: { transform: "translate(calc(100cqw - 100%), 0)" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "rotate(215deg) translateX(-500px)", opacity: "0" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "shine-pulse": {
          "0%": { "background-position": "0% 0%" },
          "50%": { "background-position": "100% 100%" },
          to: { "background-position": "0% 0%" },
        },
      },
    },
  },
  plugins: [addVariablesForColors, generateDotUtilities],
};
