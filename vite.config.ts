import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

function copyRecursive(src: string, dest: string) {
  const entries = readdirSync(src);

  for (const entry of entries) {
    if (entry.includes(' copy.')) continue;

    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    try {
      const stat = statSync(srcPath);
      if (stat.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else if (stat.isFile()) {
        copyFileSync(srcPath, destPath);
      }
    } catch (e) {
      console.error(`Error copying ${srcPath}:`, e);
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-public-filter',
      apply: 'build',
      writeBundle() {
        const publicDir = 'public';
        const outDir = 'dist';

        try {
          copyRecursive(publicDir, outDir);
        } catch (e) {
          console.error('Error copying public files:', e);
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: 'public',
});
