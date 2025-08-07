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
    
    // Suppress false positive warnings from webpack cache and dynamic imports
    config.infrastructureLogging = {
      level: 'error',
    };
    
    config.ignoreWarnings = [
      // Standard webpack warnings
      /Parsing.*failed at 'import\(/,
      /Build dependencies behind this expression are ignored/,
      // Module-specific warnings
      { module: /node_modules.*@tailwindcss/ },
      { module: /node_modules.*unplugin/ },
      { module: /node_modules.*local-pkg/ },
      { module: /node_modules.*unimport/ },
      { module: /node_modules.*jiti/ },
      { module: /node_modules.*mlly/ },
      // Function to catch cache strategy warnings
      (warning) => {
        return warning.message && (
          warning.message.includes('webpack.cache.PackFileCacheStrategy') ||
          warning.message.includes('Build dependencies behind this expression are ignored')
        );
      },
    ];
    
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
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["css-loader"],
      },
    },
  },
};

export default nextConfig;
