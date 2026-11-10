/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // avoids double-mounting the WebGL scene in development
  transpilePackages: ['three'],
};

export default nextConfig;
