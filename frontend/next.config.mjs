/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/resume/:sessionId',
        destination: '/api/serveTemp/:sessionId',
      },
    ];
  },
};

export default nextConfig;