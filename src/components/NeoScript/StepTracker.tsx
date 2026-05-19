import { useEffect, useState } from "react";

type StepTrackerProps = {
  active: boolean;
};

export default function StepTracker({ active }: StepTrackerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }

    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div
        className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent"
        style={{ animation: "spin 0.8s linear infinite" }}
      />

      <p className="text-sm text-violet-300 font-medium">
        Generating your content
        <span
          style={{ animation: "ellipsis 1.5s steps(4, end) infinite" }}
          className="inline-block w-4 overflow-hidden align-bottom"
        >
          ...
        </span>
        <span className="text-white/40 ml-1">({elapsed}s)</span>
      </p>

      <p className="text-xs text-white/30">
        This takes 1–3 minutes. Please keep this tab open.
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ellipsis {
          0%  { width: 0; }
          25% { width: 0.4em; }
          50% { width: 0.8em; }
          75% { width: 1.2em; }
          100% { width: 0; }
        }
      `}</style>
    </div>
  );
}
