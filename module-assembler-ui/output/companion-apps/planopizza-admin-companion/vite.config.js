import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    allowedHosts: ['localhost', '.be1st.app', '.be1st.io', '.up.railway.app']
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: ['localhost', '.be1st.app', '.be1st.io', '.up.railway.app']
  },
  build: {
    outDir: 'dist'
  }
});
