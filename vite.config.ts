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
        // Exclude /api/* so json-server is not rewritten to index.html (order alone is not enough).
        rewrites: [{ source: '/((?!api/).*)', destination: '/index.html' }],
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
