import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Multi-page app — both pages are entry points
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        delhi: resolve(__dirname, 'delhi.html'),
      },
    },
  },

  // Dev server config
  server: {
    port: 3000,
    open: true, // auto-opens browser on `npm run dev`
  },

  // Preview (production preview) config
  preview: {
    port: 3000,
  },
})
