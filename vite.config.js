import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite + React config.
// Vercel auto-detects this project — no vercel.json needed.
// Local dev: `npm run dev`. Production build: `npm run build` → `dist/`.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
