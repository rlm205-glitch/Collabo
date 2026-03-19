import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/authentication': 'http://localhost:8000',
      '/project_management': 'http://localhost:8000',
      '/profile_management': 'http://localhost:8000',
    },
  },
})
