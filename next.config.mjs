import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

const withNextIntl = createNextIntlPlugin(
  // Specify a custom path to the plugin here
  "./src/i18n/request.ts",
);

export default withNextIntl(nextConfig);
