import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // react + react-dom MUST stay in the same chunk (splitting causes white-screen crash in prod)
          if (/node_modules\/(react|react-dom|react-router|scheduler)(\/|$)/.test(id)) {
            return 'vendor';
          }
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('@tanstack')) return 'query';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor-libs';
        },
      },
    },
  }
})
