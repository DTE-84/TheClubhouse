import { defineConfig } from 'vite' // <--- This line was likely missing!
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/TheClubhouse/',
  plugins: [react()],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
