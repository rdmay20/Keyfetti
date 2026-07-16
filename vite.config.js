import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist'
  },
  plugins: [
    // The old hand-written service worker just re-fetched every request, so the
    // app claimed to be a PWA but had no offline support at all. Workbox
    // precaches the real (hash-named) build output instead, which is what makes
    // the game usable on a plane or in a car.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: 'Keyfetti Typing',
        short_name: 'Keyfetti',
        description: 'Kids typing game - press letters and watch them pop!',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF6B6B',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          // Android crops icons to its own mask; this one keeps the art inside
          // the safe zone so the K doesn't get its corners shaved off.
          { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
