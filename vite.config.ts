import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rawBasePath = process.env.VITE_BASE_PATH || '/'
const normalizedBasePath = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`

// https://vite.dev/config/
export default defineConfig({
  base: normalizedBasePath,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
