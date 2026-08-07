import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function buildImageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    { protocol: "http", hostname: "localhost", port: "5000", pathname: "/api/uploads/**" },
    { protocol: "http", hostname: "127.0.0.1", port: "5000", pathname: "/api/uploads/**" },
    { protocol: "https", hostname: "sitifystudio.com", pathname: "/api/uploads/**" },
    { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
  ];

  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw || raw.startsWith("/")) return patterns;

  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    patterns.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/api/uploads/**",
    });
  } catch {
    /* ignore invalid env */
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512, 640, 750, 828, 1080],
    remotePatterns: buildImageRemotePatterns(),
  },
  async rewrites() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
    const remoteApi =
      raw && raw.startsWith('http')
        ? raw.replace(/\/$/, '')
        : null;
    const apiOrigin = remoteApi ?? 'http://localhost:5000/api';

    return [
      // Browsers request /favicon.ico by default; proxy CMS icon.
      {
        source: '/favicon.ico',
        destination: '/site-icon',
      },
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;