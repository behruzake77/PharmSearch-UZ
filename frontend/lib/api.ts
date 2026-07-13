"use client";

const API_BASE_URL = "/api/v1";

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorResponse {
  error?: {
    code: string;
    message: string;
  };
  detail?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  let data: ErrorResponse | T;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = (await response.text()) as any;
  }

  if (!response.ok) {
    const errorData = data as ErrorResponse;
    const code = errorData.error?.code || "UNKNOWN_ERROR";
    const message =
      errorData.error?.message || errorData.detail || "An error occurred";
    throw new ApiError(code, message, response.status);
  }

  return data as T;
}

// ============ Auth ============

export interface CurrentUser {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "pharmacist";
  pharmacy_id: number | null;
}

export interface TokenResponse {
  access_token: string;
  user: CurrentUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse<TokenResponse>(response);
  localStorage.setItem("token", data.access_token);
  return data;
}

export async function getMe(): Promise<CurrentUser> {
  const token = getToken();
  if (!token) throw new ApiError("NO_TOKEN", "No auth token found", 401);

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<CurrentUser>(response);
}

export function logout(): void {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// ============ Search ============

export interface SearchResultItem {
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  source: "gopharm" | "google";
}

export interface SearchResponse {
  raw_transcript: string;
  corrected_query: string | null;
  confidence: number;
  results: SearchResultItem[];
  alternative_matches: string[];
  message: string | null;
}

export interface TextSearchRequest {
  query: string;
}

export async function searchByVoice(
  audioBlob: Blob
): Promise<SearchResponse> {
  const token = getToken();
  if (!token) throw new ApiError("NO_TOKEN", "Not authenticated", 401);

  const formData = new FormData();
  formData.append("audio_file", audioBlob, "audio.webm");

  const response = await fetch(`${API_BASE_URL}/search/voice`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return handleResponse<SearchResponse>(response);
}

export async function searchByText(
  query: string
): Promise<SearchResponse> {
  const token = getToken();
  if (!token) throw new ApiError("NO_TOKEN", "Not authenticated", 401);

  const response = await fetch(`${API_BASE_URL}/search/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  return handleResponse<SearchResponse>(response);
}

export interface SearchHistoryItem {
  id: number;
  corrected_query: string | null;
  result_found: boolean;
  created_at: string;
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
}

export async function getSearchHistory(
  limit: number = 20
): Promise<SearchHistoryItem[]> {
  const token = getToken();
  if (!token) throw new ApiError("NO_TOKEN", "Not authenticated", 401);

  const response = await fetch(
    `${API_BASE_URL}/search/history?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await handleResponse<SearchHistoryResponse>(response);
  return data.history;
}
