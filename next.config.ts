import type { NextConfig } from "next";

const backendUrl = (process.env["NEXT_PUBLIC_API_URL"] ?? "http://127.0.0.1:8000").replace(
  "localhost",
  "127.0.0.1",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // OBS Browser Source loads 127.0.0.1 while dev server may report localhost
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return [
      // Proxy Socket.io + API through Next.js so OBS Browser Source (same origin) can connect
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
