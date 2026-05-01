import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          storage: ['dexie'],
          excel: ['xlsx'],
          icons: ['@heroicons/vue/24/outline'],
        },
      },
    },
  },
})
