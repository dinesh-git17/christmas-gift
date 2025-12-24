import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Capacitor - outputs static HTML/CSS/JS to 'out' folder
  output: "export",

  // Disable image optimization for static export (Next.js Image requires server)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
