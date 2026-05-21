/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // exceljs has a nontrivial `exports` map that the Next webpack bundler chokes on.
    // Require it at runtime instead.
    serverComponentsExternalPackages: ["exceljs"]
  }
};
module.exports = nextConfig;
