/** @type {import('next').NextConfig} */
// NOTE: The GitHub Pages workflow (.github/workflows/deploy.yml) expects a
// static "./out" folder. Next.js only produces that when output is "export".
// If you deploy to a project page (https://<user>.github.io/<repo>/), also
// uncomment basePath/assetPrefix below and set <repo> to your repo name —
// otherwise every asset (JS/CSS/images) will 404 on GitHub Pages.
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  // basePath: "/<repo>",
  // assetPrefix: "/<repo>/",
  images: {
    unoptimized: true, // required for static export; next/image isn't used anyway
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" }
    ]
  }
};

export default nextConfig;
