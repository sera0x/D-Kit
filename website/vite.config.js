import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', 'localhost', 'dkit.name.ng'],
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
