import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    /**
     * All imagery is served from /public once the approved assets land, so no
     * remote patterns are configured — the previous Unsplash allowance is gone
     * along with the stock photography it enabled.
     *
     * next/image generates AVIF and WebP derivatives at these widths, so a 4K
     * master is never sent to a phone.
     */
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2560, 3840],
    imageSizes: [96, 160, 256, 384, 512, 768],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
