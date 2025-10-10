import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // <--- DIESE ZEILE HINZUFÜGEN
  plugins: [react( )],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        // Tailwind CSS v4 wird als Vite-Plugin importiert
        // @tailwindcss/vite ist bereits in package.json als devDependency
        // und wird von Vite automatisch erkannt und angewendet
        // Daher ist hier keine explizite Konfiguration mehr nötig
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://fleet-management-backend-t0q7.onrender.com',
        changeOrigin: true,
        rewrite: (path ) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  preview: {
    host: true,
    port: 10000,
    strictPort: true,
    allowedHosts: [
      'fleet-management-frontend-nu5y.onrender.com',
    ],
  },
})