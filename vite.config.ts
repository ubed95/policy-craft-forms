import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from 'vite-plugin-dts';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Only generate type declarations in library build mode
    ...(mode === 'production' ? [
      dts({
        tsconfigPath: './tsconfig.build.json',
        rollupTypes: true,
        copyDtsFiles: false,
      })
    ] : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: mode === 'production' ? {
    // Library build configuration (for npm package distribution)
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'NvestFormEngine',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  } : {
    // Development app build configuration (for Lovable preview)
    outDir: 'dist-dev',
    sourcemap: true,
  },
}));
