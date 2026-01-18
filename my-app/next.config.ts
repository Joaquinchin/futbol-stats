import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // No ejecutar ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // No ejecutar TypeScript check durante el build de producción
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
