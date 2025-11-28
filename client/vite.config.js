import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Разрешаем внешний доступ
    cors: true, // Включаем CORS для dev сервера
  }
})