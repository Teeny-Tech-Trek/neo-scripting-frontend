import { useState } from "react";
import CodeBlock from "./CodeBlock";

type Client = {
  id: string;
  label: string;
  description: string;
  language: string;
  code: string;
};

const CLIENTS: Client[] = [
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    description: "Add this to your claude_desktop_config.json file",
    language: "json",
    code: `{
  "mcpServers": {
    "neo-script": {
      "type": "sse",
      "url": "https://neo-script-mcp.onrender.com/sse"
    }
  }
}`,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    description: "Run this command in your terminal",
    language: "shell",
    code: `claude mcp add neo-script --transport sse https://neo-script-mcp.onrender.com/sse`,
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "Add this to your Cursor MCP settings under Settings → MCP",
    language: "json",
    code: `{
  "mcpServers": {
    "neo-script": {
      "url": "https://neo-script-mcp.onrender.com/sse",
      "type": "sse"
    }
  }
}`,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    description: "Add this to your ~/.codeium/windsurf/mcp_config.json",
    language: "json",
    code: `{
  "mcpServers": {
    "neo-script": {
      "serverUrl": "https://neo-script-mcp.onrender.com/sse"
    }
  }
}`,
  },
];

export default function ClientTabs() {
  const [active, setActive] = useState<string>("claude-desktop");
  const client = CLIENTS.find((c) => c.id === active) ?? CLIENTS[0];

  return (
    <div>
      <div role="tablist" className="flex gap-1.5 flex-wrap">
        {CLIENTS.map((c) => {
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(c.id)}
              className={[
                "relative px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200",
                isActive
                  ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/25 hover:text-white/70",
              ].join(" ")}
            >
              {c.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>

      <div
        className="mt-3 rounded-xl p-5 space-y-3 border border-white/[0.07]"
        style={{ background: "rgba(12, 12, 20, 0.7)" }}
      >
        <p className="text-sm text-white/45">{client.description}</p>
        <CodeBlock code={client.code} language={client.language} />
      </div>
    </div>
  );
}
