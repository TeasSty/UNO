import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Local: base `/`. GitHub Pages project site: set VITE_BASE=/UNO/ (see Actions workflow).
const base = process.env.VITE_BASE || (process.env.GITHUB_PAGES === 'true' ? '/UNO/' : '/')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        consent: resolve(__dirname, 'consent.html'),
      },
    },
  },
})
