/** @type {import('next').NextConfig} */

// ลดขนาดของ JavaScript bundle
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config, { dev, isServer }) => {
    // ลบ console.log ออกจาก production build
    if (!dev && !isServer) {
      config.optimization.minimizer.push(
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig; 