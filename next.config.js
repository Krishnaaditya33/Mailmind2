/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Optional in Next.js 15, can remove
  output: 'export',
  distDir: 'build', // this is okay
  trailingSlash: true,
  rewrites: async () => [],
  redirects: async () => [],
  headers: async () => []
};
module.exports = nextConfig;
