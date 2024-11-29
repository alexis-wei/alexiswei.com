// next.config.mjs
import Icons from "unplugin-icons/webpack";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/webpack";

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
    config.plugins.push(
      AutoImport({
        resolvers: [
          IconsResolver({
            prefix: "Icon",
            extension: "jsx",
          }),
        ],
        dts: true,
        eslintrc: {
          enabled: true,
        },
      }),
      Icons({
        compiler: "jsx",
        jsx: "react",
      }),
    );

    return config;
  },
};

export default nextConfig;
