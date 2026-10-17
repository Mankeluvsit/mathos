import { execFileSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  define: { __MATHOS_SOURCE__: JSON.stringify({ revision: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), dirty: Boolean(execFileSync('git', ['status', '--porcelain'], {encoding: 'utf8'}).trim()) }) },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
