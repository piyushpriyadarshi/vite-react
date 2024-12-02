import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: `https://ehfe-frontend-app.b-cdn.net/${process.env.TEST_SESSIONID}`,
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "[name].[hash].js", // All chunked vendor code will go here
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".css")) {
            return "assets/[name].[hash][extname]";
          }
          return "assets/[name][extname]";
        },
        // Custom chunk splitting
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Exclude node_modules from being bundled
            return "vendor"; // This will be the shared vendor chunk if needed
          }
        },
      },
    },
    // Externalize vendor libraries
  },
  transformIndexHtml: {
    enforce: "pre",
    transform: (html) => {
      console.log("Transforming index.html");

      return html.replace(
        "</head>",
        '<script src="https://ehfe-frontend-app.b-cdn.net/vendor.js"></script></head>'
      );
    },
  },
});
