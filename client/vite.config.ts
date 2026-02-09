import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

function serveServiceWorker() {
  return {
    name: "serve-service-worker",
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/sw.js") {
          const swPath = path.resolve(__dirname, "src/sw.js");
          const code = fs.readFileSync(swPath);
          res.setHeader("Content-Type", "application/javascript");
          res.end(code);
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), serveServiceWorker()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        sw: path.resolve(__dirname, "src/sw.js")
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === "sw" ? "sw.js" : "assets/[name]-[hash].js")
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5174",
        changeOrigin: true
      }
    }
  }
});
