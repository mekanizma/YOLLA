import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react()],
  optimizeDeps: {
    include: ['antd', '@ant-design/icons', '@ant-design/charts'],
    exclude: ['lucide-react']
  },
  // SUPABASE_* değişkenlerini de istemciye geçir
  envPrefix: ['VITE_', 'SUPABASE_'],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          charts: ['@ant-design/charts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          pdf: ['@react-pdf/renderer', 'jspdf'],
          excel: ['xlsx']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1a56db'
        }
      }
    }
  }
};
});
