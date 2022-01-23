import path from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: { include: ['react/jsx-runtime'] },
  plugins: [react({
    jsxImportSource: "@emotion/react",
    babel: {
      plugins: ["@emotion/babel-plugin"],
    },
  })],
  define: {
    'process.env': process.env
  },
  resolve:{
    alias:{
      '@camberi/firecms' : path.resolve(__dirname, '../src')
    },
  },
})
