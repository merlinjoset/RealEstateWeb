import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7080',
        changeOrigin: true,
        secure: false, // accept the .NET self-signed dev cert
      },
    },
  },
  // `vite preview` (used by `npm start` on Render) blocks unknown hosts by
  // default. Whitelist Render's *.onrender.com subdomains plus localhost so
  // production deploys aren't rejected with "Blocked request".
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      '.onrender.com', // any Render subdomain (leading dot = wildcard)
      'localhost',
    ],
  },
})
