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

const EXAMPLE_DRUGS = ["Paracetamol", "Ibuprofen", "No-Shpa", "Aspirin", "Amoxicillin"];

export default function SearchPage() {
  const router = useRouter();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    } else {
      // Auto-focus the input so users can start typing immediately
      inputRef.current?.focus();
    }
  }, [router]);

  // Recording timer
  useEffect(() => {
    if (recordingState === "recording") {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

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
      setError(
        "Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan mikrofon ruxsatini bering, yoki quyidagi matn qidiruvidan foydalaning."
      );
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

  function handleMicClick() {
    if (recordingState === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }

  const isProcessing = recordingState === "processing";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Dori qidirish</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Dori nomini yozing va <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 text-xs font-mono">Enter</kbd> bosing, yoki mikrofon tugmasini bosib ayting
        </p>
      </div>

      {/* Text search — ASOSIY qidiruv */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleTextSearch(textQuery);
        }}
        className="flex w-full gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={textQuery}
          onChange={(e) => setTextQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleTextSearch(textQuery);
            }
          }}
          placeholder="Dori nomini yozing: paracetamol, ibuprofen..."
          disabled={isProcessing}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 text-base placeholder:text-zinc-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isProcessing || !textQuery.trim()}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          {isProcessing ? "Qidirilmoqda..." : "Qidirish"}
        </button>
      </form>

      {/* Quick example buttons */}
      {!response && !error && (
        <div className="flex w-full flex-col gap-2">
          <p className="text-xs text-zinc-400">Tezkor qidiruv:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_DRUGS.map((drug) => (
              <button
                key={drug}
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setTextQuery(drug);
                  handleTextSearch(drug);
                }}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              >
                {drug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="flex-1 border-t border-zinc-200" />
        <span className="text-xs text-zinc-400">yoki ovoz bilan</span>
        <div className="flex-1 border-t border-zinc-200" />
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 disabled:opacity-60 ${
            recordingState === "recording"
              ? "scale-110 bg-red-500 shadow-red-200 hover:bg-red-600"
              : "bg-blue-600 shadow-blue-200 hover:scale-105 hover:bg-blue-700 hover:shadow-blue-300"
          }`}
          aria-label={recordingState === "recording" ? "Yozishni to'xtatish" : "Ovoz yozishni boshlash"}
        >
          {recordingState === "recording" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
          )}
          {isProcessing ? <Spinner /> : recordingState === "recording" ? <StopIcon /> : <MicIcon />}
        </button>

        <p className="min-h-[1.25rem] text-sm text-zinc-500 text-center max-w-xs">
          {recordingState === "recording" && (
            <span className="text-red-600 font-medium">
              {recordingSeconds}s — to&apos;xtatish uchun bosing
            </span>
          )}
          {isProcessing && "Ovoz qayta ishlanmoqda..."}
          {recordingState === "idle" && "Bosing va dori nomini ayting"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex w-full items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-red-500">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="flex w-full flex-col gap-4">
          {/* Query info */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">So&apos;rov:</span>{" "}
            &laquo;{response.raw_transcript}&raquo;
            {response.corrected_query &&
              response.corrected_query.toLowerCase() !== response.raw_transcript.toLowerCase() && (
                <>
                  {" "}
                  &rarr;{" "}
                  <span className="font-medium text-zinc-900">{response.corrected_query}</span>{" "}
                  <span className="text-zinc-400">({Math.round(response.confidence * 100)}% mos)</span>
                </>
              )}
          </div>

          {/* Result count */}
          {response.results.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700">
                {response.results.length} ta mahsulot topildi
              </p>
              <button
                type="button"
                onClick={() => {
                  setResponse(null);
                  setTextQuery("");
                  inputRef.current?.focus();
                }}
                className="text-xs text-zinc-400 hover:text-zinc-600 transition"
              >
                Tozalash ✕
              </button>
            </div>
          )}

          {/* No results */}
          {response.message && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-amber-500">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-800">{response.message}</p>
            </div>
          )}

          {/* Result cards */}
          {response.results.map((result, index) => (
            <ResultCard key={`${result.name}-${index}`} result={result} />
          ))}

          {/* Alternative matches */}
          {response.alternative_matches.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-600">
                Boshqa mos dorilar:
              </p>
              <div className="flex flex-wrap gap-2">
                {response.alternative_matches.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setTextQuery(name);
                      handleTextSearch(name);
                    }}
                    className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
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
