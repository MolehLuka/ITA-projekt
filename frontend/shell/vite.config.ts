import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const devRemotes = {
  members: {
    type: 'module' as const,
    name: 'members',
    entry: 'http://localhost:5174/remoteEntry.js',
  },
  facilities: {
    type: 'module' as const,
    name: 'facilities',
    entry: 'http://localhost:5175/remoteEntry.js',
  },
  bookings: {
    type: 'module' as const,
    name: 'bookings',
    entry: 'http://localhost:5176/remoteEntry.js',
  },
}

const prodRemotes = {
  members: {
    type: 'module' as const,
    name: 'members',
    entry: '/mf/members/remoteEntry.js',
  },
  facilities: {
    type: 'module' as const,
    name: 'facilities',
    entry: '/mf/facilities/remoteEntry.js',
  },
  bookings: {
    type: 'module' as const,
    name: 'bookings',
    entry: '/mf/bookings/remoteEntry.js',
  },
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'shell',
      remotes: mode === 'production' ? prodRemotes : devRemotes,
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
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
  build: {
    target: 'esnext',
  },
}))
