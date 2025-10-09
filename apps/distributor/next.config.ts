import path from "node:path";
import type { NextConfig } from "next";

import baseConfig from "../../next.config";

const nextConfig: NextConfig = {
  ...(baseConfig as NextConfig),
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
