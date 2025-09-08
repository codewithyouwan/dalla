/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.extensions = [
      ...config.resolve.extensions,
      '.js',
      '.mjs',
      '.json',
      '.cjs',
      '.jsx',
      '.ts',
      '.tsx',
    ];
    return config;
  },
};

export default nextConfig;
