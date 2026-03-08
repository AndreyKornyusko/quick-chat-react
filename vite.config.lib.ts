import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "QuickChatReact",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@supabase/supabase-js",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@supabase/supabase-js": "supabase",
        },
      },
    },
    cssCodeSplit: false,
    outDir: "dist",
  },
});
