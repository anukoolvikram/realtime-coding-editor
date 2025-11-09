import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      '/socket.io': { target: 'http://localhost:3001', ws: true },
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
