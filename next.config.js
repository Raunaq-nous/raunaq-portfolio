/** @type {import('next').NextConfig} */
const basePath = '/raunaq-portfolio';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
