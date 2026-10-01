import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/Socio_Top_Paper") when hosting under a sub-path like GitHub Pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
