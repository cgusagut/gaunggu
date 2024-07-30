import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
        additionalData: '@import "./src/assets/style/global.less";'
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve('src'),
      "@root": resolve(""),
      "@package": resolve("package.json"),
    }
  },
})
