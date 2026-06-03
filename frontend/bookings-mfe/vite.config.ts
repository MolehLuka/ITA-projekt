import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const port = 5176
const prodBase = '/mf/bookings/'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? prodBase : '/',
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'bookings',
      filename: 'remoteEntry.js',
      exposes: {
        './BookingsApp': './src/BookingsApp.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  server: {
    port,
    strictPort: true,
    origin: `http://localhost:${port}`,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
}))
