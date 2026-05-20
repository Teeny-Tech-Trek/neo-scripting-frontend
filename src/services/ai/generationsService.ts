import { aiFetch } from "./aiClient";

export type GenerationStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "cancelled";

export type GenerationMode = "blog" | "social";

export type GenerationHistoryItem = {
  request_id: string;
  prompt: string;
  brand_name: string;
  company_url: string;
  platforms: string[];
  generated_topic: string | null;
  status: GenerationStatus;
  error_message: string | null;
  source_channel: string;
  requested_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
};

export type CitationSourceKind = "user_doc" | "keyword" | "competitor" | "web";

export type Citation = {
  start_offset: number;
  end_offset: number;
  // The exact substring of blog_markdown that this citation covers — the
  // MD viewer uses this for in-DOM substring matching.
  matched_text: string;
  source_kind: CitationSourceKind;
  confidence: number | null;
  keyword: string | null;
  source_document_id: string | null;
  document_title: string | null;
  document_filename: string | null;
};

export type GenerationDetail = {
  request_id: string;
  status: GenerationStatus;
  mode: GenerationMode;
  generated_topic: string | null;
  brand_name: string;
  company_url: string;
  prompt: string;
  platforms: string[];
  blog_markdown: string | null;
  blog_title: string | null;
  blog_word_count: number | null;
  social_posts: Record<string, string>;
  citations: Citation[];
  // Per-platform citations for the social post previews.
  social_citations: Record<string, Citation[]>;
  requested_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
};

export const listGenerations = (limit = 20) =>
  aiFetch<GenerationHistoryItem[]>(`/user/generations?limit=${limit}`);

export const getGeneration = (requestId: string) =>
  aiFetch<GenerationDetail>(`/user/generations/${encodeURIComponent(requestId)}`);

export const deleteGeneration = (requestId: string) =>
  aiFetch<void>(`/user/generations/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
  });
