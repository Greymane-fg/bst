import { defineConfig } from 'vite';

export default defineConfig({
  // Relative assets also work when hosted at /bst/ on GitHub Pages.
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.e2b.app'],
    watch: {
      ignored: ['**/playwright-report/**', '**/test-results/**', '**/coverage/**', '**/.cache/**'],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: ['.e2b.app'],
  },
  build: {
    target: 'es2022',
  },
});
