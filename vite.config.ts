import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    cors: true,

    // ✅ Allow requests from your ngrok domain
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "unpalpitating-gladys-perfectly.ngrok-free.dev", // 👈 your ngrok domain
    ],

    // ✅ Proxy to your local backend
    proxy: {
      "/podcasts": {
        target: "http://localhost:5000", // backend stays local
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));