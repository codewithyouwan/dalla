/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.extensions = ['.js', '.mjs', '.json', '.cjs'];
    return config;
  },
};

export default nextConfig;