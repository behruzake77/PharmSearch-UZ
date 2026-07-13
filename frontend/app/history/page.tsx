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

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<SearchHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    getHistory()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Tarixni yuklab bo'lmadi"));
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Qidiruvlar tarixi</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {items && items.length === 0 && (
        <p className="text-sm text-zinc-500">Hali hech qanday qidiruv qilinmagan</p>
      )}

      {items && items.length > 0 && (
        <ul className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-zinc-900">
                  {item.corrected_query ?? "Aniqlanmadi"}
                </p>
                <p className="text-xs text-zinc-500">{formatDate(item.created_at)}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.result_found
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {item.result_found ? "Topildi" : "Topilmadi"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
