import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/mobile': {
        target: 'http://localhost:8089',
        changeOrigin: true,
      },
      '/v3/api-docs': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
})
