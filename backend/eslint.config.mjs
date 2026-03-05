import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    rules: {
      // Permitir any — el código actual lo usa mucho (catch blocks, callbacks, etc.)
      "@typescript-eslint/no-explicit-any": "off",

      // Permitir console — no hay logger estructurado aún
      "no-console": "off",

      // Unused vars: ignorar si empiezan con _ o son parámetros de catch/callbacks
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: ".",
        },
      ],

      // Permitir requires en casos especiales 
      "@typescript-eslint/no-require-imports": "off",

      // Permitir funciones vacías (middlewares noop, etc.)
      "@typescript-eslint/no-empty-function": "off",

      // No forzar return types — el código actual no los tiene
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Permitir non-null assertion
      "@typescript-eslint/no-non-null-assertion": "off",

      // Permitir namespaces (Express global augmentation)
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "jest.config.js"],
  }
);
