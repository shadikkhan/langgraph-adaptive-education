import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Environment variables prefixed with VITE_ will be exposed to the client
    define: {
      'import.meta.env.VITE_CHAT_RETENTION_HOURS': JSON.stringify(env.VITE_CHAT_RETENTION_HOURS || '24')
    }
  }
})
