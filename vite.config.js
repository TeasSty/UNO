import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Local: base `/`. GitHub Pages project site: set VITE_BASE=/UNO/ (see Actions workflow).
const base = process.env.VITE_BASE || (process.env.GITHUB_PAGES === 'true' ? '/UNO/' : '/')

export default defineConfig({
  plugins: [react()],
  base,
})
