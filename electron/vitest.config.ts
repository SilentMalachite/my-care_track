import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
  },
  resolve: {
    alias: {
      electron: path.resolve(__dirname, './tests/mocks/electron.ts'),
    },
  },
});