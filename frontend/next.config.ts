import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Replit preview proxies requests from a different origin/host,
     so the dev server must accept any incoming host header. */
  allowedDevOrigins: ["*"],

  /* Backend (FastAPI) ishlaydi 127.0.0.1:8000 da, alohida workflow sifatida.
     Brauzerdan to'g'ridan-to'g'ri boshqa portga so'rov yuborish CORS/proxy
     muammolarini keltirib chiqarishi mumkin, shuning uchun Next.js dev
     serveri o'zi ichki proksi vazifasini bajaradi: /api/* so'rovlari
     brauzer nuqtai nazaridan bir xil origin (5000-port) bo'lib qoladi. */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
