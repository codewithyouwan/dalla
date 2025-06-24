/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/temp/:path*',
        destination: '/api/serveTemp?path=:path*',
      },
    ];
  },
};

export default nextConfig;