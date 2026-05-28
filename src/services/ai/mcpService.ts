import { aiFetch } from "./aiClient";

export type McpServerStatus = {
  status: "ok";
  server: string;
  version: string;
  active_sessions: number;
};

// Pings the MCP server's /status endpoint directly. Bypasses aiFetch (which
// targets FastAPI) — this one talks to the MCP bridge host. URL is derived
// from VITE_MCP_URL by stripping the /sse suffix.
export async function getMcpServerStatus(mcpSseUrl: string): Promise<McpServerStatus> {
  // mcpSseUrl looks like "http://host[:port]/sse" — strip /sse to hit /status.
  const base = mcpSseUrl.replace(/\/sse\/?$/i, "");
  const res = await fetch(`${base}/status`, { method: "GET" });
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
