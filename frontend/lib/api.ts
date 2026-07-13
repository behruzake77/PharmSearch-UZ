/**
 * Backend (FastAPI) bilan ishlash uchun yordamchi funksiyalar.
 *
 * Token hozircha localStorage'da saqlanadi (loyiha kichik bo'lgani uchun
 * sodda yechim yetarli — BOSQICH 9'da to'liq autentifikatsiya oqimi bilan
 * qattiqlashtiriladi: avtomatik redirect, har bir so'rovga header qo'shish
 * markazlashtirilgan holda, va h.k.)
 */

const TOKEN_KEY = "avqt_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function logout(): void {
  clearToken();
  window.location.href = "/login";
}

export interface ApiErrorPayload {
  error?: { code: string; message: string };
  detail?: { error?: { code: string; message: string } } | string;
}

export class ApiError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = await response.json();
  } catch {
    // javob JSON emas — umumiy xabar bilan davom etamiz
  }

  const detail = payload?.detail;
  if (detail && typeof detail === "object" && detail.error) {
    return new ApiError(detail.error.message, detail.error.code);
  }
  if (payload?.error) {
    return new ApiError(payload.error.message, payload.error.code);
  }
  if (typeof detail === "string") {
    return new ApiError(detail, "UNKNOWN");
  }
  return new ApiError("Kutilmagan xatolik yuz berdi", "UNKNOWN");
}

/**
 * Autentifikatsiya talab qiladigan barcha so'rovlar shu funksiya orqali
 * o'tadi: tokenni header'ga qo'shadi va agar backend 401 (token yo'q/muddati
 * tugagan) qaytarsa, tokenni tozalab foydalanuvchini avtomatik login
 * sahifasiga qaytaradi — bu logikani har bir sahifada alohida takrorlash
 * shart emas.
 */
async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(path, { ...init, headers });

  if (response.status === 401 && typeof window !== "undefined") {
    clearToken();
    window.location.href = "/login";
  }

  return response;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export interface SearchResultItem {
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  source: string;
}

export interface SearchResponse {
  raw_transcript: string;
  corrected_query: string | null;
  confidence: number;
  results: SearchResultItem[];
  alternative_matches: string[];
  message: string | null;
}

export async function searchByText(query: string): Promise<SearchResponse> {
  const response = await authFetch("/api/v1/search/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function searchByVoice(audioBlob: Blob): Promise<SearchResponse> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "audio.webm");

  // Voice transcription can take up to 30s on CPU — use AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await authFetch("/api/v1/search/voice", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw await parseErrorResponse(response);
    }
    return response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "So'rov vaqti tugdi. Dori nomini qisqaroq va aniqroq aytib ko'ring.",
        "TIMEOUT"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface SearchHistoryItem {
  id: number;
  corrected_query: string | null;
  result_found: boolean;
  created_at: string;
}

export async function getHistory(limit = 20): Promise<SearchHistoryItem[]> {
  const response = await authFetch(`/api/v1/search/history?limit=${limit}`);
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  const payload = await response.json();
  return payload.history;
}
