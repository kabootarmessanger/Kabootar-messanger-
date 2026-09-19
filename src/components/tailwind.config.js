/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C85A32",
        primaryLight: "#FDF2EE",
        green: "#25D366",
        blue: "#34B7F1",
        bg2: "#F7F8FA",
        bg3: "#F0F2F5",
        chatbg: "#EFEAE2",
        out: "#DCF8C6",
        din: "#FFFFFF"
      },
      maxWidth: {
        app: "520px"
      }
    }
  },
  plugins: []
};
