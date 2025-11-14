import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use a production base path so built assets are referenced under /chat/
  // (we mount the built UI at /chat). In dev we keep '/' so Vite dev server
  // continues to work on localhost:5173.
  base: mode === 'production' ? '/chat/' : '/',
  server: {
    host: '0.0.0.0', // Listen on all IPv4 interfaces for mobile testing
    port: 5173,
    strictPort: true, // Fail if port is taken
    cors: true, // Enable CORS for dev server (frontend only)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Grace by Atuche',
        short_name: 'Grace',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#667eea',
        description: 'Your intelligent fashion assistant for Atuche. Browse collections, get style advice, and shop with ease.',
        categories: ['shopping', 'fashion', 'lifestyle', 'business'],
        icons: [
          {
            src: 'favicon.ico',
            sizes: '16x16 32x32 48x48',
            type: 'image/x-icon',
          },
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any',
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
