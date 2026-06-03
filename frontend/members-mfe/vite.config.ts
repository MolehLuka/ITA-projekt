import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const port = 5174
const prodBase = '/mf/members/'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? prodBase : '/',
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'members',
      filename: 'remoteEntry.js',
      exposes: {
        './MembersApp': './src/MembersApp.tsx',
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
