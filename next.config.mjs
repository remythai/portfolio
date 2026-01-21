/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 60,
      qualities: [75, 80, 85],
    },
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
  };
  
  export default nextConfig;
  