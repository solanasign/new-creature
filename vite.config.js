import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.mjs', '.cjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          framer: ['framer-motion'],
          router: ['react-router-dom'],
        },
      },
    },
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'react-router-dom', 'jwt-decode'],
    exclude: ['@types/jsonwebtoken'],
    force: false,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    hmr: {
      overlay: false
    }
  },
})
