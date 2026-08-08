/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // JalRakshak design tokens - a river/monsoon palette, not a generic SaaS blue.
        paper: "#F6F3EC",       // warm off-white background, paper-map feel
        ink: "#101B1D",         // near-black text
        river: {
          50: "#EAF4F5",
          100: "#DCEEF0",       // flood-water light surface
          400: "#3E93A6",
          600: "#1C6E8C",       // primary - monsoon blue
          800: "#0E3B43",       // deep river-teal - primary dark
          900: "#0A2A30",
        },
        alert: {
          amber: "#F2A93B",     // SOS / warning accent
          red: "#C43D3D",       // critical only - used sparingly
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        // "waterline" signature motif - a rising-fill gradient used on progress/occupancy elements
        waterline: "linear-gradient(180deg, transparent 0%, transparent var(--fill, 50%), theme(colors.river.100) var(--fill, 50%))",
      },
    },
  },
  plugins: [],
};
