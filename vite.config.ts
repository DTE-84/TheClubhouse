// vite.config.ts
export default defineConfig({
  base: '/TheClubhouse/',
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        // If a library is looking for these, tell Rollup to stay away
        './cjs/react.production.min.js',
        './cjs/react-jsx-runtime.production.min.js'
      ]
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
})
