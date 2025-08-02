import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // This allows access from outside the container
    port: 5173, // Make sure it matches what your container exposes
    strictPort: true, // Ensures it fails if port 5173 is not available
  },
});
