import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@libsql/client", "libsql"],
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
