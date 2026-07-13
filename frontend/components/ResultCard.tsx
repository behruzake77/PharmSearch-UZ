import Image from "next/image";
import { SearchResultItem } from "@/lib/api";

function formatPrice(price: number | null): string | null {
  if (price === null) return null;
  return `${new Intl.NumberFormat("uz-UZ").format(price)} so'm`;
}

export default function ResultCard({ result }: { result: SearchResultItem }) {
  const price = formatPrice(result.price);

  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
        {result.image_url ? (
          <Image
            src={result.image_url}
            alt={result.name}
            width={80}
            height={80}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-zinc-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1">
        <h3 className="font-medium text-zinc-900 leading-snug">{result.name}</h3>
        {result.description && (
          <p className="text-sm text-zinc-500 line-clamp-2">{result.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {price ? (
            <span className="text-sm font-semibold text-blue-600">{price}</span>
          ) : (
            <span className="text-sm text-zinc-400">Narx ko&apos;rsatilmagan</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            result.source === "gopharm"
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-500"
          }`}>
            {result.source === "gopharm" ? "GoPharm" : "Google"}
          </span>
        </div>
      </div>
    </div>
  );
}
