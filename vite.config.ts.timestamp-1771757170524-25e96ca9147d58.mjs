// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { copyFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";
function copyRecursive(src, dest) {
  const entries = readdirSync(src);
  for (const entry of entries) {
    if (entry.includes(" copy.")) continue;
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
var vite_config_default = defineConfig({
  plugins: [
    react(),
    {
      name: "copy-public-filter",
      apply: "build",
      writeBundle() {
        const publicDir = "public";
        const outDir = "dist";
        try {
          copyRecursive(publicDir, outDir);
        } catch (e) {
          console.error("Error copying public files:", e);
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  publicDir: "public"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5mdW5jdGlvbiBjb3B5UmVjdXJzaXZlKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcpIHtcbiAgY29uc3QgZW50cmllcyA9IHJlYWRkaXJTeW5jKHNyYyk7XG5cbiAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgaWYgKGVudHJ5LmluY2x1ZGVzKCcgY29weS4nKSkgY29udGludWU7XG5cbiAgICBjb25zdCBzcmNQYXRoID0gam9pbihzcmMsIGVudHJ5KTtcbiAgICBjb25zdCBkZXN0UGF0aCA9IGpvaW4oZGVzdCwgZW50cnkpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXQgPSBzdGF0U3luYyhzcmNQYXRoKTtcbiAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgbWtkaXJTeW5jKGRlc3RQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgY29weVJlY3Vyc2l2ZShzcmNQYXRoLCBkZXN0UGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgY29weUZpbGVTeW5jKHNyY1BhdGgsIGRlc3RQYXRoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBjb3B5aW5nICR7c3JjUGF0aH06YCwgZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3B5LXB1YmxpYy1maWx0ZXInLFxuICAgICAgYXBwbHk6ICdidWlsZCcsXG4gICAgICB3cml0ZUJ1bmRsZSgpIHtcbiAgICAgICAgY29uc3QgcHVibGljRGlyID0gJ3B1YmxpYyc7XG4gICAgICAgIGNvbnN0IG91dERpciA9ICdkaXN0JztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvcHlSZWN1cnNpdmUocHVibGljRGlyLCBvdXREaXIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29weWluZyBwdWJsaWMgZmlsZXM6JywgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxhQUFhLFVBQVUsaUJBQWlCO0FBQy9ELFNBQVMsWUFBWTtBQUVyQixTQUFTLGNBQWMsS0FBYSxNQUFjO0FBQ2hELFFBQU0sVUFBVSxZQUFZLEdBQUc7QUFFL0IsYUFBVyxTQUFTLFNBQVM7QUFDM0IsUUFBSSxNQUFNLFNBQVMsUUFBUSxFQUFHO0FBRTlCLFVBQU0sVUFBVSxLQUFLLEtBQUssS0FBSztBQUMvQixVQUFNLFdBQVcsS0FBSyxNQUFNLEtBQUs7QUFFakMsUUFBSTtBQUNGLFlBQU0sT0FBTyxTQUFTLE9BQU87QUFDN0IsVUFBSSxLQUFLLFlBQVksR0FBRztBQUN0QixrQkFBVSxVQUFVLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDdkMsc0JBQWMsU0FBUyxRQUFRO0FBQUEsTUFDakMsV0FBVyxLQUFLLE9BQU8sR0FBRztBQUN4QixxQkFBYSxTQUFTLFFBQVE7QUFBQSxNQUNoQztBQUFBLElBQ0YsU0FBUyxHQUFHO0FBQ1YsY0FBUSxNQUFNLGlCQUFpQixPQUFPLEtBQUssQ0FBQztBQUFBLElBQzlDO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ047QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLGNBQWM7QUFDWixjQUFNLFlBQVk7QUFDbEIsY0FBTSxTQUFTO0FBRWYsWUFBSTtBQUNGLHdCQUFjLFdBQVcsTUFBTTtBQUFBLFFBQ2pDLFNBQVMsR0FBRztBQUNWLGtCQUFRLE1BQU0sK0JBQStCLENBQUM7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsV0FBVztBQUNiLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
