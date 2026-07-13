"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  SearchResponse,
  getToken,
  searchByText,
  searchByVoice,
} from "@/lib/api";
import ResultCard from "@/components/ResultCard";

type RecordingState = "idle" | "recording" | "processing";

export default function SearchPage() {
  const router = useRouter();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, [router]);

  async function startRecording() {
    setError(null);
    setResponse(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordingState("processing");
        try {
          const result = await searchByVoice(audioBlob);
          setResponse(result);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Qidiruvda xatolik yuz berdi");
        } finally {
          setRecordingState("idle");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");
    } catch {
      setError("Mikrofonga ruxsat berilmadi yoki u mavjud emas");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function handleTextSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setError(null);
    setResponse(null);
    setRecordingState("processing");
    try {
      const result = await searchByText(trimmed);
      setResponse(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Qidiruvda xatolik yuz berdi");
    } finally {
      setRecordingState("idle");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Dori qidirish</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mikrofon tugmasini bosib dori nomini ayting, yoki pastda yozib qidiring
        </p>
      </div>

      <button
        type="button"
        onClick={recordingState === "recording" ? stopRecording : startRecording}
        disabled={recordingState === "processing"}
        className={`flex h-28 w-28 items-center justify-center rounded-full text-white shadow-lg transition disabled:opacity-60 ${
          recordingState === "recording"
            ? "animate-pulse bg-red-500 hover:bg-red-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-label={recordingState === "recording" ? "Yozishni to'xtatish" : "Ovoz yozishni boshlash"}
      >
        {recordingState === "processing" ? (
          <Spinner />
        ) : (
          <MicIcon />
        )}
      </button>

      <p className="text-sm text-zinc-500">
        {recordingState === "recording" && "Yozilmoqda... tugmani qayta bosib to'xtating"}
        {recordingState === "processing" && "Qidirilmoqda..."}
        {recordingState === "idle" && !response && "Boshlash uchun tugmani bosing"}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleTextSearch(textQuery);
        }}
        className="flex w-full gap-2"
      >
        <input
          type="text"
          value={textQuery}
          onChange={(e) => setTextQuery(e.target.value)}
          placeholder="Yoki dori nomini yozing..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={recordingState === "processing"}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          Qidirish
        </button>
      </form>

      {error && (
        <p className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {response && (
        <div className="flex w-full flex-col gap-4">
          <div className="rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">Eshitilgan matn:</span>{" "}
            &laquo;{response.raw_transcript}&raquo;
            {response.corrected_query && (
              <>
                {" "}
                &rarr; aniqlangan: <span className="font-medium">{response.corrected_query}</span>{" "}
                ({Math.round(response.confidence * 100)}%)
              </>
            )}
          </div>

          {response.message && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {response.message}
            </p>
          )}

          {response.results.map((result, index) => (
            <ResultCard key={`${result.name}-${index}`} result={result} />
          ))}

          {response.alternative_matches.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">
                Boshqa mos nomzodlar:
              </p>
              <div className="flex flex-wrap gap-2">
                {response.alternative_matches.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleTextSearch(name)}
                    className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 transition hover:border-blue-500 hover:text-blue-600"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}
