/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.externals.push({
      canvas: "canvas",
    });
    return config;
  },
};

export default nextConfig;
