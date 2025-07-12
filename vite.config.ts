import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { ProxyOptions } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 타입을 명확히 하기 위한 별도 설정 객체
  const proxyConfig: Record<string, ProxyOptions> = {
    '/api': {
      target: env.VITE_API_PROXY_TARGET,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          if (req.headers.cookie) {
            proxyReq.setHeader('Cookie', req.headers.cookie);
          }
        });

        proxy.on('proxyRes', (proxyRes, req, res) => {
          if (proxyRes.headers['set-cookie']) {
            proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map((cookie: string) =>
                cookie.replace(/SameSite=Strict/gi, 'SameSite=Lax')
            );
          }
        });
      }
    }
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['@mui/material', '@mui/icons-material'],
    },
    server: {
      proxy: proxyConfig,
    },
  };
});
