import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker'
import react from '@vitejs/plugin-react-swc';

const PORT = 3030;

export default defineConfig({
  plugins: [
    react(),
    checker({
      // eslint: {
      //   lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      //   dev: { logLevel: ['error'] },
      // },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    port: PORT,
    host: true,
  },
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  preview: {
    port: PORT,
    host: true,
  },
});
