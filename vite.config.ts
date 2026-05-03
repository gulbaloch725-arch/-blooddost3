import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        includeAssets: ['logo.svg'],
        manifest: {
          id: '/',
          name: 'Blood Dost - Blood Donation Platform',
          short_name: 'Blood Dost',
          description: 'Linking NGOs, hospitals, and life-saving blood donors in real-time.',
          theme_color: '#ef4444',
          background_color: '#ffffff',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'en-US',
          categories: ['health', 'medical', 'productivity'],
          icons: [
            {
              src: 'logo.svg',
              sizes: '72x72 96x96 128x128 144x144 152x152 192x192 384x384 512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'logo.svg',
              sizes: '72x72 96x96 128x128 144x144 152x152 192x192 384x384 512x512',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: 'logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              form_factor: 'wide',
              label: 'Blood Dost Application'
            },
            {
              src: 'logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              form_factor: 'narrow',
              label: 'Blood Dost Application'
            }
          ],
          shortcuts: [
            {
              name: 'Request Blood',
              url: '/request',
              icons: [{ src: 'logo.svg', sizes: 'any' }]
            },
            {
              name: 'Find Donors',
              url: '/donors',
              icons: [{ src: 'logo.svg', sizes: 'any' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
