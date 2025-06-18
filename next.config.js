/** @type {import('next').NextConfig} */

// ลดขนาดของ JavaScript bundle
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  
  // ปรับปรุง image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    formats: ['image/webp'],
  },
  
  // เพิ่ม experimental features ที่ช่วยให้โหลดหน้าเร็วขึ้น
  experimental: {
    optimizeCss: true,              // เปิดใช้งาน CSS optimization
    scrollRestoration: true,        // เปิดใช้งาน scroll restoration
    serverActions: {
      bodySizeLimit: '2mb',         // ปรับขนาด request body limit
    },  
    optimizePackageImports: ['lucide-react'],  // เปิดใช้งาน tree-shaking สำหรับ packages ที่ระบุ
  },
  
  // ปรับแต่ง webpack เพื่อลดขนาด bundle
  webpack: (config, { isServer }) => {
    // Tree-shaking สำหรับ lodash และ libraries อื่นๆ
    config.optimization.usedExports = true;
    
    // ลบ console.log ใน production builds
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer = config.optimization.minimizer || [];
      
      // ใช้ Terser plugin เพื่อลบ console.log
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // ลบ console.log
              drop_debugger: true, // ลบ debugger statements
            },
          },
        })
      );
    }
    
    return config;
  },
  
  // เพิ่มการกำหนด headers เพื่อเพิ่มประสิทธิภาพ
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // On-demand Incremental Static Regeneration
  // สำหรับหน้าที่เปลี่ยนแปลงไม่บ่อย
  async rewrites() {
    return {
      beforeFiles: [
        // สามารถใส่ rewrites เพื่อเพิ่มประสิทธิภาพได้
      ],
    };
  },
};

module.exports = withBundleAnalyzer(nextConfig); 