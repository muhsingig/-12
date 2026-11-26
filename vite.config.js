import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The project folder is "#12"; Vite cannot serve paths containing "#", so it runs through the
// junction Downloads\elin-solvik (see README). preserveSymlinks keeps every id on that clean path.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' }, preserveSymlinks: true },
  server: { port: 5250, strictPort: true }
});
