import { aiFetch } from "./aiClient";

export type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scope: "frontend" | "mcp" | "admin";
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  created_at: string;
};

// Returned ONLY on creation. `secret` is the raw key the user must copy now —
// never readable again.
export type ApiKeyCreated = ApiKey & { secret: string };

export const listApiKeys = () =>
  aiFetch<ApiKey[]>("/user/api-keys");

export const createApiKey = (name: string) =>
  aiFetch<ApiKeyCreated>("/user/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const revokeApiKey = (id: string) =>
  aiFetch<void>(`/user/api-keys/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
