/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  //output: 'export',

  // ✅ Disable Turbopack (forces Webpack for builds)
  experimental: {
    turbo: false,
  },

  transpilePackages: [
    "react-slick",
    "slick-carousel",
    "@tailwindcss/postcss",
  ],

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
