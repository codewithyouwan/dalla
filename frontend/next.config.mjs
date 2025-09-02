/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/tmp/:path*',
        destination: '/api/serveResume?path=:path*',
      },
    ];
  },
};

export default nextConfig;