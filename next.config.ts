import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Wyłączone rewrites - używamy proxy serwera zamiast bezpośrednich przekierowań
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/backend/:path*",
  //       destination: "http://localhost:8000/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;
