// next.config.mjs
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import type { Configuration as WebpackConfig } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  // Set different output directories based on environment
  distDir: process.env.NODE_ENV === "production" ? ".next-prod" : ".next-dev",
  allowedDevOrigins: ["192.168.178.114"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dgcydirlu/image/**",
      },
      {
        protocol: "https",
        hostname: "s3.growagram.com",
      },
    ],
  },
  webpack(config: WebpackConfig): WebpackConfig {
    // Modified SVG configuration
    const rules = config.module?.rules || [];
    rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            icon: true,
            typescript: true,
            ext: "tsx",
            svgProps: {
              className: "w-full h-full",
            },
          },
        },
        "url-loader",
      ],
    });

    return config;
  },
} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withNextIntl(nextConfig);
