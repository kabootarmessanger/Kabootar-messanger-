// Runs after `next build` (see package.json "postbuild").
//
// `public/manifest.json` ships with root-relative paths ("/icon.svg", ...)
// which is correct for the default deploy target (domain root: Vercel,
// Netlify, Firebase Hosting, a plain server, ...). Next.js's basePath does
// NOT rewrite files copied verbatim from `public/`, so when this app is
// built for a sub-path deploy (GitHub Project Pages, via
// NEXT_PUBLIC_BASE_PATH) we prefix those paths in the exported ./out copy
// only — the source file in public/ is left untouched.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (!basePath) {
  process.exit(0); // default root deploy — nothing to rewrite
}

const manifestPath = "out/manifest.json";
if (!existsSync(manifestPath)) {
  console.warn(`[fix-basepath] ${manifestPath} not found, skipping`);
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const prefix = (p) => (p.startsWith("/") ? `${basePath}${p}` : p);

manifest.start_url = prefix(manifest.start_url);
manifest.scope = prefix(manifest.scope);
manifest.icons = (manifest.icons || []).map((icon) => ({ ...icon, src: prefix(icon.src) }));

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`[fix-basepath] rewrote ${manifestPath} for basePath "${basePath}"`);

