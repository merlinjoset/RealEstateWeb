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
      // Production nginx rewrites these root paths to the backend so search
      // engines see /sitemap.xml at the public domain. Mirror that in dev
      // so we can hit the same URLs locally.
      '/sitemap.xml':            { target: 'https://localhost:7080', changeOrigin: true, secure: false },
      '/sitemap-properties.xml': { target: 'https://localhost:7080', changeOrigin: true, secure: false },
      // Property images — stored under /media on the API. Property.Images
      // values are relative ("/media/2026/05/foo.jpg") so they resolve via
      // the page origin in both dev (here) and prod (nginx).
      '/media':                  { target: 'https://localhost:7080', changeOrigin: true, secure: false },
    },
  },
  // `vite preview` (used by `npm start` on Render) blocks unknown hosts by
  // default. Whitelist Render's *.onrender.com subdomains, our custom
  // *.joseforland.com domains, and localhost so production deploys aren't
  // rejected with "Blocked request".
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      '.onrender.com',     // any Render subdomain (leading dot = wildcard)
      '.joseforland.com',  // joseforland.com + any subdomain (demo, www, etc.)
      'localhost',
    ],
  },
})
