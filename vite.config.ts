import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { getVercelEntries } from 'vite-plugin-vercel'
import vercel from 'vite-plugin-vercel/vite'

export default defineConfig(async () => {
  const entries = await getVercelEntries('api', { destination: 'api' })

  return {
    plugins: [
      react(),
      vercel({
        entries,
        rewrites: [{ source: '/(.*)', destination: '/index.html' }],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})
