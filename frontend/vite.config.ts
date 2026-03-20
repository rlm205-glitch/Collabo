import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/authentication': 'http://localhost:9012',
      '/project_management': 'http://localhost:9012',
      '/profile_management': 'http://localhost:9012',
    },
  },
})
