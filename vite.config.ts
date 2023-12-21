import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
      manifest: {
        // Customize the manifest file
        name: 'Super TicTacToe',
        short_name: 'Super TicTacToe',
        description: 'Super TicTacToe',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        // icons: [
        //   {
        //     src: 'path/to/icon.png',
        //     sizes: '192x192',
        //     type: 'image/png',
        //   },
        // ],
      },

    })],
})
