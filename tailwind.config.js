/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C14",
        surface: "#0F172A",
        surfaceLight: "#1E293B",
        vietRed: {
          light: "#FF4D4D",
          DEFAULT: "#DA251D",
          dark: "#991B1B",
        },
        vietGold: {
          light: "#FFE066",
          DEFAULT: "#FFCD00",
          dark: "#D97706",
        },
        team: {
          tienPhong: "#EF4444",
          triThuc: "#EAB308",
          xungKich: "#F97316",
          danTocTonGiao: "#10B981",
          kieuBao: "#A855F7",
          banBeQuocTe: "#3B82F6",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "arena-glow": "radial-gradient(circle at 50% 0%, rgba(218, 37, 29, 0.25) 0%, rgba(8, 12, 20, 0) 70%)",
        "gold-glow": "radial-gradient(circle at 50% 100%, rgba(255, 205, 0, 0.18) 0%, rgba(8, 12, 20, 0) 60%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce 2s infinite",
        "spin-slow": "spin 12s linear infinite",
      }
    },
  },
  plugins: [],
};
