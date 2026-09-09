import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where the .NET API listens. `dotnet run --project Gym.API` (http profile) serves it here.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5204'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      // Proxy /api to the .NET server so the browser makes same-origin calls
      // (no CORS preflight, no self-signed-cert prompt in dev).
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
  }
})
