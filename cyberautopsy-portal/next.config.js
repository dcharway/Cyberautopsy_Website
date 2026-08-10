/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // exceljs has a nontrivial `exports` map that the Next webpack bundler chokes on.
    // Require it at runtime instead. pdfkit ships its standard fonts as .afm assets
    // resolved via __dirname — also keep it external so the bundler doesn't try to
    // rewrite those paths.
    // parse/node ships XHR + WebSocket adapters that don't survive Next's
    // client-bundle pass; keep it server-external.
    serverComponentsExternalPackages: ["exceljs", "pdfkit", "parse"]
  }
};
module.exports = nextConfig;
