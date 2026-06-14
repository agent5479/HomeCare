import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/HomeCare/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [],
      },
      manifest: {
        name: 'CareMarshall',
        short_name: 'CareMarshall',
        description: 'Professional Care Management System for New Zealand',
        theme_color: '#1976D2',
        background_color: '#FFF8F0',
        display: 'standalone',
        start_url: '/HomeCare/',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../docs',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('fullcalendar')) return 'calendar';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
