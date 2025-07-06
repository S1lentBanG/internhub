import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  css: {
    postcss: './postcss.config.cjs',  // Explicitly tell Vite where the PostCSS config is
  },
  server: {
    port: 3000,
    open: true,
  },
});
