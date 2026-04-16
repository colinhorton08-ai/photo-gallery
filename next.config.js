import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow large image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
}

export default nextConfig
