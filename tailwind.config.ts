import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hsbc: {
          red: "#DB0011",
          black: "#333333",
          gray: {
            50: "#F9F9F9",
            100: "#F6F6F6",
            200: "#EAEAEA",
            300: "#D7D8D6",
            400: "#767676",
            500: "#4D4D4D",
          }
        },
        semantic: {
          background: {
            canvas: "var(--semantic-color-background-canvas-standard, #ffffff)",
          },
          text: {
            primary: "var(--semantic-color-text-primary-default, #333333)",
          }
        }
      },
      fontFamily: {
        hsbc: ["Univers Next for HSBC", "Arial", "sans-serif"],
        public: ["Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
