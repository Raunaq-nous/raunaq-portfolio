/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Update this if deploying to a subpath like username.github.io/repo-name
  // basePath: '/repo-name',
};

module.exports = nextConfig;
