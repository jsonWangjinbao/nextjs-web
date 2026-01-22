import plugin from "tailwindcss/plugin";

export default plugin(function ({ addUtilities, addComponents, theme }) {
  // Example: Adding a custom utility for text-shadow
  addUtilities({
    ".text-shadow-sm": {
      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
    },
    ".text-shadow": {
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    ".text-shadow-md": {
      textShadow: "4px 4px 8px rgba(0, 0, 0, 0.12)",
    },
  });

  // Example: Adding a custom component class
  addComponents({
    ".card": {
      backgroundColor: theme("colors.white"),
      borderRadius: theme("borderRadius.lg"),
      padding: theme("spacing.6"),
      boxShadow: theme("boxShadow.md"),
    },
  });
});
