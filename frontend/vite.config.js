/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_BASE_URL || 'http://127.0.0.1:3001';

  return {
    plugins: [react(), tailwind()],
    server: {
      proxy: {
        '/socket.io': {
          target: proxyTarget, 
          ws: true,
        },
        '/api': {
          target: proxyTarget, 
          changeOrigin: true,
        },
      },
    },
  };
});
