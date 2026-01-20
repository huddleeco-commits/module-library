import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    },
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'process.env': {}
  }
});