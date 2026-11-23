import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './', // rutas relativas: funciona en GitHub Pages e itch.io
  server: { port: 8080 },
  build: { chunkSizeWarningLimit: 2000 }, // Phaser pesa ~1.2 MB; no es un problema
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node', // los tests unitarios NO importan Phaser: solo lógica pura
  },
});
