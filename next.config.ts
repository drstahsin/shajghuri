import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: '/product-images/**', search: '' },
      { pathname: '/brand-logo-bw.png', search: '' },
      { pathname: '/brand-logo-color.png', search: '' },
      { pathname: '/brand-logo-1.png', search: '' },
      { pathname: '/brand-logo-2.png', search: '' },
      { pathname: '/logo.png', search: '' },
    ],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests" },
      ],
    }];
  },
};

export default nextConfig;
