"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getToken, logout } from "@/lib/api";

const links = [
  { href: "/", label: "Qidiruv" },
  { href: "/history", label: "Tarix" },
];

export default function NavBar() {
  const pathname = usePathname();
  // Login va chiqish har doim to'liq sahifa yuklanishi (window.location.href)
  // orqali amalga oshiriladi, shuning uchun NavBar har safar yangi tokenni
  // (yoki uning yo'qligini) shu lazy initializer orqali to'g'ri o'qiydi —
  // alohida effект/setState kaskadiga hojat yo'q.
  const [loggedIn] = useState(() => typeof window !== "undefined" && Boolean(getToken()));

  if (pathname === "/login") return null;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <span className="text-sm font-semibold text-zinc-900">AVQT</span>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href
                  ? "text-blue-600"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {loggedIn && (
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-zinc-500 transition hover:text-red-600"
            >
              Chiqish
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
