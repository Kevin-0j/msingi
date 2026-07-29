import { dirname } from 'path'
import { fileURLToPath } from 'url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root: a stray lockfile above this directory otherwise
  // makes Next infer the wrong root and warn on every build.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
