// vite.config.ts
import path from "path";
import { defineConfig } from "file:///Users/francesco/firecms_v4/.yarn/__virtual__/vite-virtual-6fbc63b6da/0/cache/vite-npm-5.4.21-12a8265f9b-7177fa03cf.zip/node_modules/vite/dist/node/index.js";
import react from "@vitejs/plugin-react";
var __vite_injected_original_dirname = "/Users/francesco/firecms_v4/packages/backend";
var ReactCompilerConfig = {
  target: "18"
};
var isExternal = (id) => !id.startsWith(".") && !path.isAbsolute(id);
var vite_config_default = defineConfig(() => ({
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" }
  },
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "Rebase Backend",
      fileName: (format) => `index.${format}.js`
    },
    target: "ESNEXT",
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: isExternal
    }
  },
  resolve: {
    alias: {
      "@rebasepro/types": path.resolve(__vite_injected_original_dirname, "../types/src"),
      "@rebasepro/common": path.resolve(__vite_injected_original_dirname, "../common/src")
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig]
        ]
      }
    })
  ]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZnJhbmNlc2NvL2ZpcmVjbXNfdjQvcGFja2FnZXMvYmFja2VuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2ZyYW5jZXNjby9maXJlY21zX3Y0L3BhY2thZ2VzL2JhY2tlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2ZyYW5jZXNjby9maXJlY21zX3Y0L3BhY2thZ2VzL2JhY2tlbmQvdml0ZS5jb25maWcudHNcIjsvLyBAdHMtaWdub3JlXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiXG5cbmNvbnN0IFJlYWN0Q29tcGlsZXJDb25maWcgPSB7XG4gICAgdGFyZ2V0OiBcIjE4XCJcbn07XG5cbmNvbnN0IGlzRXh0ZXJuYWwgPSAoaWQ6IHN0cmluZykgPT4gIWlkLnN0YXJ0c1dpdGgoXCIuXCIpICYmICFwYXRoLmlzQWJzb2x1dGUoaWQpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCkgPT4gKHtcbiAgICBlc2J1aWxkOiB7XG4gICAgICAgIGxvZ092ZXJyaWRlOiB7IFwidGhpcy1pcy11bmRlZmluZWQtaW4tZXNtXCI6IFwic2lsZW50XCIgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgbGliOiB7XG4gICAgICAgICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICAgICAgICBuYW1lOiBcIlJlYmFzZSBCYWNrZW5kXCIsXG4gICAgICAgICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGluZGV4LiR7Zm9ybWF0fS5qc2BcbiAgICAgICAgfSxcbiAgICAgICAgdGFyZ2V0OiBcIkVTTkVYVFwiLFxuICAgICAgICBtaW5pZnk6IGZhbHNlLFxuICAgICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGV4dGVybmFsOiBpc0V4dGVybmFsXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIFwiQHJlYmFzZXByby90eXBlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL3R5cGVzL3NyY1wiKSxcbiAgICAgICAgICAgIFwiQHJlYmFzZXByby9jb21tb25cIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9jb21tb24vc3JjXCIpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcmVhY3Qoe1xuICAgICAgICAgICAgYmFiZWw6IHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIFtcImJhYmVsLXBsdWdpbi1yZWFjdC1jb21waWxlclwiLCBSZWFjdENvbXBpbGVyQ29uZmlnXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIF1cbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFVBQVU7QUFFakIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBSmxCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sc0JBQXNCO0FBQUEsRUFDeEIsUUFBUTtBQUNaO0FBRUEsSUFBTSxhQUFhLENBQUMsT0FBZSxDQUFDLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLFdBQVcsRUFBRTtBQUU3RSxJQUFPLHNCQUFRLGFBQWEsT0FBTztBQUFBLEVBQy9CLFNBQVM7QUFBQSxJQUNMLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBLEVBQ3hEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxLQUFLO0FBQUEsTUFDRCxPQUFPLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDN0MsTUFBTTtBQUFBLE1BQ04sVUFBVSxDQUFDLFdBQVcsU0FBUyxNQUFNO0FBQUEsSUFDekM7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNYLFVBQVU7QUFBQSxJQUNkO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsb0JBQW9CLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDMUQscUJBQXFCLEtBQUssUUFBUSxrQ0FBVyxlQUFlO0FBQUEsSUFDaEU7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsTUFDRixPQUFPO0FBQUEsUUFDSCxTQUFTO0FBQUEsVUFDTCxDQUFDLCtCQUErQixtQkFBbUI7QUFBQSxRQUN2RDtBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQ0osRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
