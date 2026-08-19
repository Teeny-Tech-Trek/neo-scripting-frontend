import { aiFetch } from "./aiClient";

export type McpServerStatus = {
  status: "ok";
  server: string;
  version: string;
  active_sessions: number;
};

/** Strip the transport path off VITE_MCP_URL to get the server origin. */
export function mcpBaseUrl(mcpUrl: string): string {
  return mcpUrl.replace(/\/(mcp|sse)\/?$/i, "");
}

// Pings the MCP server's /status endpoint directly. Bypasses aiFetch (which
// targets FastAPI) — this one talks to the MCP host. Accepts either transport
// URL (".../mcp" or the legacy ".../sse") since VITE_MCP_URL may still point
// at either during the migration.
export async function getMcpServerStatus(mcpUrl: string): Promise<McpServerStatus> {
  const res = await fetch(`${mcpBaseUrl(mcpUrl)}/status`, { method: "GET" });
  if (!res.ok) throw new Error(`MCP /status returned ${res.status}`);
  return res.json();
}

export type McpCall = {
  request_id: string;
  title: string;
  requested_at: string | null;
  status: "pending" | "running" | "success" | "failed" | "cancelled";
  platforms: string[];
  duration_ms: number | null;
};

export type McpUsage = {
  recent_calls: McpCall[];
  calls_today: number;
  calls_this_month: number;
  last_call_at: string | null;
  daily_limit: number;
  plan_name: string;
};

export const getMcpUsage = (limit = 10) =>
  aiFetch<McpUsage>(`/user/mcp/usage?limit=${limit}`);
