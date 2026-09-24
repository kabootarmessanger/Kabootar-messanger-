/** @type {import('next').NextConfig} */
// Static export: this app is 100% client-rendered (Firebase client SDK,
// no server secrets), so `next build` produces a plain "./out" folder that
// can be hosted anywhere (Vercel static, Netlify, S3/CloudFront, Firebase
// Hosting, GitHub Pages, a plain nginx box, ...).
//
// basePath/assetPrefix are OFF by default, so a normal deploy (custom
// domain or host root, e.g. Vercel/Netlify/Firebase Hosting) just works.
// Only GitHub Project Pages (https://<user>.github.io/<repo>/) need a
// basePath, because the site is served from a sub-path instead of the
// domain root. To build for that case, set NEXT_PUBLIC_BASE_PATH to
// "/<repo>" (see .github/workflows/deploy.yml, which already does this).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  ...(basePath && { basePath, assetPrefix: `${basePath}/` }),
  images: {
    unoptimized: true, // required for static export; next/image isn't used anyway
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" }
    ]
  }
};

export default nextConfig;
