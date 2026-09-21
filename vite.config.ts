import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Smoke Air',
        short_name: 'Smoke Air',
        description: 'A fictional digital ritual for atmosphere and private mood journaling.',
        theme_color: '#111211',
        background_color: '#111211',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/smoke-air-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
})
