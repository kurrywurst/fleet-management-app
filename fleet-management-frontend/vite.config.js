import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path ) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
