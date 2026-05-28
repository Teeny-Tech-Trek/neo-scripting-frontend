import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  Loader2, Trash2, Upload, FileText, AlertCircle, CheckCircle2,
  RefreshCw, Tag,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  listBrands,
  listDocuments,
  uploadDocument,
  deleteDocument,
  type UserBrandSummary,
  type UserDocument,
} from "../../../services/ai/documentsService";

const BRAND_KEY = "neo_docs_last_brand";
const ACCEPTED = ".md,.txt,.pdf,.docx";
const ACCEPTED_EXTS = new Set([".md", ".txt", ".pdf", ".docx"]);

const fileExt = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
};

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const formatWhen = (iso: string | null): string => {
  if (!iso) return "—";
  const sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.round(sec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

// "acme logistics" -> "Acme Logistics" for display only; canonical form
// (lowercase, trimmed) stays on the wire.
const displayBrand = (canonical: string) =>
  canonical.replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeBrand = (raw: string) => raw.trim().toLowerCase();

export default function Documents() {
  const [brands, setBrands]           = useState<UserBrandSummary[]>([]);
  const [brandsLoading, setBrandsLoad] = useState(true);
  const [brandsError, setBrandsError]  = useState<string | null>(null);

  const [activeBrand, setActiveBrand] = useState<string>(() =>
    normalizeBrand(localStorage.getItem(BRAND_KEY) || ""),
  );
  const [newBrand, setNewBrand]       = useState<string>("");

  const [items, setItems]     = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [file, setFile]               = useState<File | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadMsg, setUploadMsg]     = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Effects ──────────────────────────────────────────────────────────────

  const loadBrands = async () => {
    setBrandsLoad(true);
    setBrandsError(null);
    try {
      const rows = await listBrands();
      setBrands(rows);
      // If we have no active brand but the user does have brands, pick the
      // most-recent one as the default selection.
      setActiveBrand((current) => current || rows[0]?.brand_name || "");
    } catch (err) {
      setBrandsError((err as Error).message || "Couldn't load brands");
    } finally {
      setBrandsLoad(false);
    }
  };

  const loadDocs = async (brand: string) => {
    if (!brand) {
      setItems([]);
      return;
    }
    setLoading(true);
    setListError(null);
    try {
      const rows = await listDocuments(brand);
      setItems(rows);
    } catch (err) {
      setListError((err as Error).message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDocs(activeBrand);
    if (activeBrand) localStorage.setItem(BRAND_KEY, activeBrand);
  }, [activeBrand]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  // When the user types a new brand name and uploads, that name becomes the
  // upload target. Otherwise uploads go to the currently selected brand.
  const uploadTargetBrand = useMemo(
    () => normalizeBrand(newBrand) || activeBrand,
    [newBrand, activeBrand],
  );

  const acceptFile = (f: File | null | undefined) => {
    if (!f) return;
    const ext = fileExt(f.name);
    if (!ACCEPTED_EXTS.has(ext)) {
      setUploadMsg({
        kind: "err",
        text: `Unsupported file type "${ext || "(no extension)"}". Allowed: .md, .txt, .pdf, .docx`,
      });
      setFile(null);
      return;
    }
    setUploadMsg(null);
    setFile(f);
  };

  // Browser fires dragenter/dragover repeatedly while the cursor hovers;
  // preventDefault on dragover is what makes the drop event fire at all.
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    acceptFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || !uploadTargetBrand) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const result = await uploadDocument(uploadTargetBrand, file);
      if (result.duplicate) {
        setUploadMsg({ kind: "ok", text: `Already in the knowledge base for ${displayBrand(uploadTargetBrand)}.` });
      } else if (result.success) {
        setUploadMsg({
          kind: "ok",
          text: `Uploaded "${result.title || file.name}" · ${result.chunk_count ?? 0} chunks.`,
        });
      } else {
        setUploadMsg({ kind: "err", text: result.error || "Upload failed" });
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh both panes — and switch to the uploaded brand if it was new.
      await loadBrands();
      setActiveBrand(uploadTargetBrand);
      setNewBrand("");
    } catch (err) {
      setUploadMsg({ kind: "err", text: (err as Error).message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document and its embeddings? This can't be undone.")) return;
    try {
      await deleteDocument(docId);
      setItems((prev) => prev.filter((d) => d.document_id !== docId));
      // If this was the last doc for the brand, the sidebar count should refresh.
      loadBrands();
    } catch (err) {
      setListError((err as Error).message || "Delete failed");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-bg-base pt-10">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-[1180px] mx-auto">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-tight text-white">
                Reference documents
              </h1>
              <p className="text-[13px] text-white/45 mt-1">
                Upload brand notes, style guides, or PDFs. The pipeline pulls
                from them when you enable "Use my reference docs" during
                generation.
              </p>
            </div>
            <button
              onClick={() => { loadBrands(); loadDocs(activeBrand); }}
              disabled={brandsLoading || loading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-white/70 hover:text-white border border-white/[0.1] rounded-lg hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={brandsLoading || loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
            {/* ─── BRANDS SIDEBAR ─── */}
            <aside
              className="rounded-2xl border border-white/[0.06] p-3"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <div className="px-2 py-2 mb-1 flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">
                  Brands
                </h2>
                {brands.length > 0 && (
                  <span className="text-[11px] text-white/35">{brands.length}</span>
                )}
              </div>

              {brandsError && (
                <p className="px-2 text-[12px] text-red-400/80">{brandsError}</p>
              )}

              {brandsLoading && brands.length === 0 ? (
                <div className="py-6 flex items-center justify-center text-white/40 text-[12px]">
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Loading…
                </div>
              ) : brands.length === 0 ? (
                <div className="py-5 px-2 text-[12px] text-white/45 leading-snug">
                  No brands yet — upload a doc below to create one.
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {brands.map((b) => {
                    const active = b.brand_name === activeBrand;
                    return (
                      <li key={b.brand_name}>
                        <button
                          onClick={() => setActiveBrand(b.brand_name)}
                          className={[
                            "w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition-colors",
                            active
                              ? "bg-violet-500/[0.12] text-white"
                              : "text-white/70 hover:text-white hover:bg-white/[0.04]",
                          ].join(" ")}
                        >
                          <Tag
                            size={12}
                            className={active ? "text-violet-300" : "text-white/35"}
                          />
                          <span className="flex-1 min-w-0 text-[13px] font-medium truncate">
                            {displayBrand(b.brand_name)}
                          </span>
                          <span
                            className={[
                              "text-[11px] font-mono px-1.5 py-0.5 rounded",
                              active
                                ? "bg-violet-500/20 text-violet-200"
                                : "bg-white/[0.06] text-white/55",
                            ].join(" ")}
                          >
                            {b.doc_count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>

            {/* ─── MAIN CONTENT ─── */}
            <div className="flex flex-col gap-5">
              {/* Upload card */}
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <p className="text-[13px] font-medium text-white/70 mb-2.5">
                  Upload to{" "}
                  <span className="text-violet-300">
                    {uploadTargetBrand ? displayBrand(uploadTargetBrand) : "a brand"}
                  </span>
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder={
                      activeBrand
                        ? `Or type a new brand name (defaults to ${displayBrand(activeBrand)})`
                        : "Brand name (e.g. Acme Logistics)"
                    }
                    className="flex-1 bg-transparent border border-white/[0.1] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-violet-500/40 hover:border-white/20 transition-colors"
                  />
                </div>

                {/* Dropzone — click to pick, OR drag a file from the OS */}
                <label
                  htmlFor="docs-file-input"
                  onDragEnter={handleDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={[
                    "block w-full rounded-xl border-2 border-dashed px-5 py-7 text-center cursor-pointer transition-colors",
                    dragOver
                      ? "border-violet-400 bg-violet-500/[0.08]"
                      : file
                        ? "border-violet-500/40 bg-violet-500/[0.04] hover:bg-violet-500/[0.06]"
                        : "border-white/15 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  <input
                    id="docs-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED}
                    onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                  <Upload
                    size={22}
                    className={[
                      "mx-auto mb-2 transition-colors",
                      dragOver ? "text-violet-300" : file ? "text-violet-300" : "text-white/40",
                    ].join(" ")}
                  />
                  {file ? (
                    <>
                      <p className="text-[13.5px] font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[12px] text-white/45 mt-0.5">
                        {formatBytes(file.size)} · click or drop another to replace
                      </p>
                    </>
                  ) : dragOver ? (
                    <p className="text-[13.5px] font-medium text-violet-200">
                      Release to attach
                    </p>
                  ) : (
                    <>
                      <p className="text-[13.5px] font-medium text-white/80">
                        Drop a file here, or{" "}
                        <span className="text-violet-300">click to browse</span>
                      </p>
                      <p className="text-[12px] text-white/40 mt-0.5">
                        .md, .txt, .pdf, .docx · up to 10 MB
                      </p>
                    </>
                  )}
                </label>

                <div className="flex items-center justify-between gap-2 mt-3">
                  {file ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-[12px] text-white/50 hover:text-white/80 transition-colors"
                    >
                      Clear file
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={handleUpload}
                    disabled={!file || !uploadTargetBrand || uploading}
                    className={[
                      "px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center gap-1.5",
                      !file || !uploadTargetBrand || uploading
                        ? "bg-violet-600/40 text-white/60 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-500 text-white",
                    ].join(" ")}
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? "Uploading…" : "Upload"}
                  </button>
                </div>
                {uploadMsg && (
                  <div
                    className={[
                      "mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] border",
                      uploadMsg.kind === "ok"
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                        : "bg-red-500/10     border-red-500/25     text-red-300",
                    ].join(" ")}
                  >
                    {uploadMsg.kind === "ok"
                      ? <CheckCircle2 size={14} />
                      : <AlertCircle size={14} />}
                    {uploadMsg.text}
                  </div>
                )}
              </div>

              {/* List card */}
              {listError && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[13px]">
                  {listError}
                </div>
              )}

              <div
                className="rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-white">
                    {activeBrand ? displayBrand(activeBrand) : "Documents"}
                  </h2>
                  {activeBrand && (
                    <span className="text-[12px] text-white/40">
                      {items.length} {items.length === 1 ? "document" : "documents"}
                    </span>
                  )}
                </div>

                {!activeBrand ? (
                  <div className="py-14 text-center text-white/40 text-[13px]">
                    Pick a brand from the sidebar, or upload to create one.
                  </div>
                ) : loading && items.length === 0 ? (
                  <div className="py-14 flex items-center justify-center text-white/40">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Loading…
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-14 flex flex-col items-center text-white/45 text-[13px]">
                    <FileText size={26} className="mb-3 text-white/30" />
                    No documents for <span className="text-white/70 ml-1">{displayBrand(activeBrand)}</span>.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
                        <th className="px-5 py-3 font-medium">Title / Filename</th>
                        <th className="px-5 py-3 font-medium">Type</th>
                        <th className="px-5 py-3 font-medium">Chunks</th>
                        <th className="px-5 py-3 font-medium">Ingested</th>
                        <th className="px-2 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((d) => (
                        <tr
                          key={d.document_id}
                          className="border-b border-white/[0.04] last:border-b-0"
                        >
                          <td className="px-5 py-3.5 max-w-[440px]">
                            <div className="text-[14px] font-medium text-white truncate">
                              {d.title}
                            </div>
                            <div className="text-[12px] text-white/45 truncate">
                              {d.filename}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-white/65 uppercase">
                            {d.doc_type}
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-white/65 font-mono">
                            {d.chunk_count}
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-white/55">
                            {formatWhen(d.ingested_at)}
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <button
                              aria-label="Delete document"
                              onClick={() => handleDelete(d.document_id)}
                              className="p-1.5 rounded-md text-white/45 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
