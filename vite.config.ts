/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: false, // Use public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Exclude large vendor chunks from precache
        globIgnores: ['**/pdf-*.js', '**/qr-*.js', '**/recharts-*.js'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
    ...(process.env.ANALYZE === 'true'
      ? [visualizer({
          open: true,
          filename: 'dist/bundle-stats.html',
          gzipSize: true,
          brotliSize: true,
        }) as PluginOption]
      : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'router': ['react-router-dom'],
          'firebase-core': ['firebase/app', 'firebase/auth'],
          'firebase-db': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage'],
          'firebase-messaging': ['firebase/messaging'],
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'qr': ['qrcode.react', 'jsqr'],
          'pdf': ['jspdf'],
          'animation': ['framer-motion'],
          'recharts': ['recharts'],
          'date-fns': ['date-fns'],
        },
      },
    },
  },
})
