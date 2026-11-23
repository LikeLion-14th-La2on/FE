import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // .env.local 에 VITE_API_PROXY_TARGET 이 있을 때만 /api 요청을 그 서버로 넘긴다 (없으면 기존과 같음)
  const proxyTarget = loadEnv(mode, process.cwd(), '').VITE_API_PROXY_TARGET

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              // 서버 CORS가 localhost 를 막으므로, 서버에는 같은 곳에서 온 요청처럼 보낸다
              configure: (proxy) => proxy.on('proxyReq', (req) => req.removeHeader('origin')),
            },
          },
        }
      : undefined,
  }
})
