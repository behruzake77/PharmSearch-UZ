import Image from "next/image";
import { SearchResultItem } from "@/lib/api";

function formatPrice(price: number | null): string | null {
  if (price === null) return null;
  return `${new Intl.NumberFormat("uz-UZ").format(price)} so'm`;
}

export default function ResultCard({ result }: { result: SearchResultItem }) {
  const price = formatPrice(result.price);

  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
        {result.image_url ? (
          <Image
            src={result.image_url}
            alt={result.name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs text-zinc-400">Rasm yo&apos;q</span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <h3 className="font-medium text-zinc-900">{result.name}</h3>
        {result.description && (
          <p className="mt-0.5 text-sm text-zinc-500">{result.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {price && <span className="text-sm font-semibold text-blue-600">{price}</span>}
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
            {result.source === "gopharm" ? "GoPharm" : "Google"}
          </span>
        </div>
      </div>
    </div>
  );
}
