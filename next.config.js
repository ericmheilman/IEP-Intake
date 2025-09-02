/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    LYZR_API_KEY: process.env.LYZR_API_KEY,
  },
}

module.exports = nextConfig

