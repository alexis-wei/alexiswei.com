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
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    });

    // Ignore canvas-related modules
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      "canvas-prebuilt": false,
    };
    return config;
  },
};

export default nextConfig;
