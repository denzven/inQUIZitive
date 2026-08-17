import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/inQUIZitive/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Q.ico', 'apple-touch-icon.png', 'masked-icon.png', 'sitemap.xml', 'site.webmanifest', 'banner.png'],
      manifest: {
        name: 'inQUIZitive - Live Event Quiz & Trivia Platform',
        short_name: 'inQUIZitive',
        description: 'Automated, multi-round quiz software for live events featuring Rapid Fire, Spin Wheel, Tic-Tac-Toe, Speed Buzzer, and Excel imports.',
        theme_color: '#264653',
        background_color: '#264653',
        display: 'standalone',
        categories: ['education', 'games', 'entertainment', 'utilities'],
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
        enabled: false
      }
    })
  ],
}))
