import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Permitir any — el código actual lo usa en catch blocks y callbacks
      "@typescript-eslint/no-explicit-any": "off",
      // Permitir <img> — se usa intencionalmente en vez de next/image
      "@next/next/no-img-element": "off",
      // Unused vars: ignorar si empiezan con _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: ".",
        },
      ],
    },
  },
];

export default eslintConfig;
