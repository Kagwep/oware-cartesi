import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@babylonjs/havok'],
},
define: {
  'process.env': {}
},
server: {
  host:'0.0.0.0',
  port:5173
}
})
