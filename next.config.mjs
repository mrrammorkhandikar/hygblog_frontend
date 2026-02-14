/** @type {import('next').NextConfig} */
const nextConfig = {

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
