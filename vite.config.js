
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages under https://<user>.github.io/<repo>/, set base to '/<repo>/'
  base: '/cook-easy/',
  build: { outDir: 'dist' }
})
