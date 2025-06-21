import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://airbnb-clone-server-ekjv.onrender.com",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV === "development",
    minify: process.env.NODE_ENV === "production" ? "esbuild" : false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
});
