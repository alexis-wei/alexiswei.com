// next.config.mjs
import Icons from "unplugin-icons/webpack";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
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
