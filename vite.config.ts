import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // Explicit output directory — matches Vercel's outputDirectory
    outDir: 'dist',
    // No sourcemaps in production (smaller bundle, no source exposure)
    sourcemap: false,
    // Raise chunk warning threshold — our bundle is large due to Leaflet + MUI
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split heavy third-party libraries into separate cached chunks
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router'],
          'vendor-leaflet': ['leaflet'],
          'vendor-charts': ['recharts'],
          'vendor-ui':    ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
})

