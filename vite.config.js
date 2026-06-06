import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  assetsInclude: ['**/*.exr', '**/*.hdr'], // Убеждаемся, что Vite обрабатывает эти форматы как ресурсы
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false },
        workbox: {
          // какие файлы собираемся кешировать
          globPatterns: ['**/*.{js,css,html,ico,png,svg,txt}'],

          // Навигационный fallback (index.html) — но исключаем sitemap/robots
          navigateFallback: '/index.html',
          // исключаем из навигационного fallback
          navigateFallbackDenylist: [
            /^\/sitemap\.xml$/,
            /^\/robots\.txt$/
          ]
        },
        includeAssets: [
          'favicon.png',
          'favicon.ico',
          'apple-touch-icon.png'
        ],
        manifest: {
          name: 'Shaders',
          short_name: 'Shaders',
          description: 'Shaders — an interactive environment for learning, experimenting with, and visualizing Vertex and Fragment Shaders',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable any'
            }
          ]
        }
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
});