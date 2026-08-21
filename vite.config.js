import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Porta fixa só do Meu IPTV (5173/5174/5180 são do Meu Ritmo e do FinPilot).
  server: { port: 5190, strictPort: true },
})
