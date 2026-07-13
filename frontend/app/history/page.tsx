"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, SearchHistoryItem, getHistory, getToken } from "@/lib/api";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SkeletonRow() {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-1.5">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
    </li>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<SearchHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    setLoading(true);
    getHistory()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Tarixni yuklab bo'lmadi");
        setLoading(false);
      });
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Qidiruvlar tarixi</h1>
        {items && items.length > 0 && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-500">
            {items.length} ta qidiruv
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-500">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <ul className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </ul>
      )}

      {!loading && items && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-zinc-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-zinc-500">Hali hech qanday qidiruv qilinmagan</p>
          <a href="/" className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Qidiruvga o&apos;tish →
          </a>
        </div>
      )}

      {!loading && items && items.length > 0 && (
        <ul className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3 transition hover:bg-zinc-50">
              <div>
                <p className="font-medium text-zinc-900">
                  {item.corrected_query ?? (
                    <span className="text-zinc-400 italic">Aniqlanmadi</span>
                  )}
                </p>
                <p className="text-xs text-zinc-400">{formatDate(item.created_at)}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.result_found
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {item.result_found ? "✓ Topildi" : "Topilmadi"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
