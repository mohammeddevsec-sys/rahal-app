import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'RAHAL - Navigation for Iraq',
        short_name: 'RAHAL',
        description: 'Iraqi navigation app with offline maps and GPS',
        theme_color: '#0b63ce',
        background_color: '#eef2f6',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/protomaps\.github\.io\/basemaps-assets\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'protomaps-assets',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: function (id) {
          if (id.indexOf('node_modules/maplibre-gl') !== -1) return 'maplibre'
          if (id.indexOf('node_modules/pmtiles') !== -1) return 'pmtiles'
          if (id.indexOf('node_modules/@protomaps/basemaps') !== -1) return 'protomaps'
          return undefined
        },
      },
    },
  },
})