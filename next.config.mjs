// next.config.js
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: { svgo: true, icon: true },
        },
      ],
    });
    return config;
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withNextIntl(nextConfig);
