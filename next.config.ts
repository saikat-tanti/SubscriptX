import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@creit.tech/stellar-wallets-kit"],
  serverExternalPackages: ["@stellar/stellar-sdk"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency/,
    ];
    return config;
  },
};

export default nextConfig;
