/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Proxy API calls to Go backend
      { source: "/api/:path*", destination: "http://localhost:8080/api/:path*" },
    ];
  },
};

export default nextConfig;