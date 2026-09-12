import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages는 https://<계정>.github.io/MyStorage/ 형태라서
// base를 저장소 이름과 맞춰줘야 빌드 후 CSS/JS/아이콘을 정상적으로 찾는다.
export default defineConfig({
  base: '/MyStorage/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'MyStorage',
        short_name: 'MyStorage',
        description: '나의 기억과 기록을 안전하게 보관하는 공간',
        theme_color: '#f7f7f2',
        background_color: '#f7f7f2',
        display: 'standalone',
        start_url: '/MyStorage/',
        scope: '/MyStorage/',
        icons: [
          { src: '/MyStorage/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/MyStorage/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
