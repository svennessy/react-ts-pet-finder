import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget =
  process.env.VITE_API_PROXY || "http://localhost:3002";

export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],

  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["maplibre-gl"],
    exclude: ["react-map-gl", "react-map-gl/maplibre"],
  },
  server: {
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});