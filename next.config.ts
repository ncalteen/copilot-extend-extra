import type { NextConfig } from 'next'
import { BASE_PATH } from './src/lib/config'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Keep repository-owned instructions unchanged when starting development.
  agentRules: false,
  // Enable static export for GitHub Pages
  output: 'export',
  // Set base path for GitHub Pages deployment only in production
  basePath: isProd ? BASE_PATH : '',
  // Set asset prefix to match basePath for GitHub Pages
  assetPrefix: isProd ? BASE_PATH : '',
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  // Trailing slash for GitHub Pages compatibility
  trailingSlash: true
}

export default nextConfig
