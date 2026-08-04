import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/inQUIZitive/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Q.ico', 'apple-touch-icon.png', 'masked-icon.png'],
      manifest: {
        name: 'InQUIZitive',
        short_name: 'InQUIZitive',
        description: 'Automated, multi-round quiz software for live events',
        theme_color: '#264653',
        background_color: '#264653',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,xlsx}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
