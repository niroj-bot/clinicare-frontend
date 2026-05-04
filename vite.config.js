import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Fix sockjs-client "global is not defined" error in browser
    global: 'globalThis',
  },
})
