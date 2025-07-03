import { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self' https://*.qstack.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.qstack.com; 
  style-src 'self' 'unsafe-inline' https://*.qstack.com; 
  img-src 'self' data: https://*.qstack.com; 
  font-src 'self' data: https://*.qstack.com; 
  connect-src 'self' https://*.qstack.com;
`;

const securityHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, must-revalidate" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Accept-Encoding", value: "br, gzip, compress" },
  { key: "Cross-Origin-Opener-Policy",value: "same-origin" }
];

/*securityHeaders.push({
  key: "Content-Security-Policy",
  value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
});*/

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      }
    ]
  },
  images: {},
  experimental: {
    optimizeCss: true,
    inlineCss: true
  },
};

export default nextConfig;