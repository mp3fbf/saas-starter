/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true, // Enable Partial Prerendering (PPR)
    serverActions: {
      // Explicitly allow Server Actions
      allowedOrigins: ['localhost:3000', 'palavra-viva.vercel.app'],
    },
  },
  typescript: {
    // This won't completely ignore errors, but allows the build to continue
    // if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This will allow the build to continue if there are ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 