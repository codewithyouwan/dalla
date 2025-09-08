/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/tmp/:path*',
        destination: '/api/serveTemp?path=:path*',
      },
    ];
  },
};

export default nextConfig;