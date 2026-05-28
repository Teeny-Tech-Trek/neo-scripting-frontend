import { aiFetch } from "./aiClient";

export type UserDocument = {
  document_id: string;
  title: string;
  filename: string;
  doc_type: string;       // "md" | "txt" | "pdf"
  chunk_count: number;
  ingested_at: string | null;
};

export type UserBrandSummary = {
  brand_name: string;                // canonical (lowercase, trimmed)
  doc_count: number;
  last_ingested_at: string | null;
};

export const listBrands = () =>
  aiFetch<UserBrandSummary[]>("/user/brands");

export type UploadResult = {
  success: boolean;
  document_id?: string;
  title?: string;
  filename?: string;
  chunk_count?: number;
  duplicate?: boolean;
  error?: string;
};

export const listDocuments = (brandName: string) =>
  aiFetch<UserDocument[]>(
    `/user/documents?brand_name=${encodeURIComponent(brandName)}`,
  );

export const uploadDocument = (brandName: string, file: File) => {
  const form = new FormData();
  form.append("brand_name", brandName);
  form.append("file", file);
  return aiFetch<UploadResult>("/user/documents", {
    method: "POST",
    body: form,
  });
};

export const deleteDocument = (documentId: string) =>
  aiFetch<void>(`/user/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
