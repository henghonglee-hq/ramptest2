import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'URampSDK',
      fileName: (format) => `uramp.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
      rollupOptions: {
        external: ['react', 'react-dom', 'cryptocurrency-icons'],
        output: {
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'style.css';
            return assetInfo.name;
          }
        }
      },
    cssCodeSplit: false
  }
})

