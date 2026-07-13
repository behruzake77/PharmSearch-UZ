export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Apteka Ovozli Qidiruv Tizimi
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Loyiha skeleti tayyor (BOSQICH 1). Mikrofon orqali dori qidiruvi
          keyingi bosqichlarda shu sahifaga qo&apos;shiladi.
        </p>
      </main>
    </div>
  );
}
