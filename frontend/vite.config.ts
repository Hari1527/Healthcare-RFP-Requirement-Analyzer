import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[vite-proxy] Backend at 127.0.0.1:8000 unavailable or restarting:', err.message);
            if (res && typeof (res as any).writeHead === 'function' && !(res as any).headersSent) {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(
                JSON.stringify({
                  error: {
                    code: 'BACKEND_UNAVAILABLE',
                    message: 'Backend server is temporarily unreachable or reloading. Please try again in a few seconds.',
                  },
                })
              );
            }
          });
        },
      },
    },
  },
});
