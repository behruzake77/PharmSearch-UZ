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
      inputRef.current?.focus();
    }
  }, [router]);

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
        <h1 className="text-3xl font-bold text-zinc-900">🔍 Dori qidirish</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Dori nomini yozing yoki mikrofon orqali aytib bering
        </p>
      </div>

      {/* Text search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleTextSearch(textQuery);
        }}
        className="w-full"
      >
        <div className="flex w-full gap-2">
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
            placeholder="Paracetamol, Ibuprofen..."
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isProcessing || !textQuery.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Qidirilmoqda..." : "Qidirish"}
          </button>
        </div>
      </form>

      {/* Quick example buttons */}
      {!response && !error && (
        <div className="w-full">
          <p className="mb-3 text-sm font-medium text-zinc-600">Tezkor qidiruv:</p>
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
                className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
              >
                {drug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="flex-1 border-t border-zinc-300" />
        <span className="text-xs font-medium text-zinc-400">YOKI OVOZ BILAN</span>
        <div className="flex-1 border-t border-zinc-300" />
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`relative flex h-28 w-28 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-200 disabled:opacity-60 ${
            recordingState === "recording"
              ? "scale-110 bg-gradient-to-br from-red-500 to-red-600 animate-pulse"
              : "bg-gradient-to-br from-blue-600 to-blue-700 hover:scale-105 hover:shadow-blue-400/50"
          }`}
          aria-label={recordingState === "recording" ? "Yozishni to'xtatish" : "Ovoz yozishni boshlash"}
        >
          {recordingState === "recording" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
          )}
          {isProcessing ? <Spinner /> : recordingState === "recording" ? <StopIcon /> : <MicIcon />}
        </button>

        <p className="min-h-[2rem] text-center text-sm text-zinc-600 max-w-xs">
          {recordingState === "recording" && (
            <span className="text-base font-semibold text-red-600">
              ⏱️ {recordingSeconds}s — to'xtatish uchun bosing
            </span>
          )}
          {isProcessing && <span className="text-blue-600 font-medium">⏳ Qayta ishlanmoqda...</span>}
          {recordingState === "idle" && <span className="text-zinc-500">🎤 Bosing va dori nomini ayting</span>}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 shrink-0 text-red-500 mt-0.5"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="w-full space-y-4">
          {/* Query info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-900">So'rov:</span>
                <span className="text-sm text-blue-700">«{response.raw_transcript}»</span>
              </div>
              {response.corrected_query &&
                response.corrected_query.toLowerCase() !== response.raw_transcript.toLowerCase() && (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm text-blue-600">→ To'g'rilangan:</span>
                    <span className="font-semibold text-blue-900">{response.corrected_query}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {Math.round(response.confidence * 100)}% mos
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* No results */}
          {response.message && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 shrink-0 text-amber-600 mt-0.5"
                >
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V5.75A.75.75 0 0 0 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">{response.message}</p>
              </div>
            </div>
          )}

          {/* Result count */}
          {response.results.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-700">
                ✅ {response.results.length} ta dori topildi
              </p>
              <button
                type="button"
                onClick={() => {
                  setResponse(null);
                  setTextQuery("");
                  inputRef.current?.focus();
                }}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-700 transition"
              >
                ✕ Tozalash
              </button>
            </div>
          )}

          {/* Result cards */}
          <div className="space-y-3">
            {response.results.map((result, index) => (
              <ResultCard key={`${result.name}-${index}`} result={result} />
            ))}
          </div>

          {/* Alternative matches */}
          {response.alternative_matches.length > 0 && (
            <div className="border-t border-zinc-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-zinc-700">📝 Boshqa mos dorilar:</p>
              <div className="flex flex-wrap gap-2">
                {response.alternative_matches.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setTextQuery(name);
                      handleTextSearch(name);
                    }}
                    className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
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

function StopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-10 w-10 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}
