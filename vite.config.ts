import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Declared locally so the config stays type-checked without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };

// GitHub Pages serves this project from /orbit-ai/; local dev and any
// root-hosted deploy serve it from /.
const base = process.env.GITHUB_PAGES === 'true' ? '/orbit-ai/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
});
