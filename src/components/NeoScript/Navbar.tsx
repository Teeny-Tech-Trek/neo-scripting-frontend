import { useEffect, useState } from "react";
import { ChevronDown, Coins, Infinity as InfinityIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCredits } from "../../context/CreditsContext";

/* ──────────────────────────────────────────────────────────────────────
   👇 LOGO CONFIG — apni logo file `public/` folder mein daal de.
   Default expects /logo.png. SVG bhi chalega — bas path update kar de.
   ────────────────────────────────────────────────────────────────────── */
const LOGO_SRC = "/logo.png";
const BRAND_NAME = "Neo Scripting";

/* ─── Sparkle fallback (jab logo image load na ho) ─────────────────── */
function SparkleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="#7c3aed"
        stroke="#a78bfa"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 3L19.75 5.25L22 6L19.75 6.75L19 9L18.25 6.75L16 6L18.25 5.25L19 3Z"
        fill="#a78bfa"
        opacity="0.75"
      />
      <path
        d="M5 17L5.5 18.5L7 19L5.5 19.5L5 21L4.5 19.5L3 19L4.5 18.5L5 17Z"
        fill="#a78bfa"
        opacity="0.5"
      />
    </svg>
  );
}

// Pick a friendly display name from whatever the backend returned. Fallback
// chain: displayName -> "first last" -> firstName -> local-part of email.
const buildDisplayName = (
  u: { firstName?: string | null; lastName?: string | null; displayName?: string | null; email?: string | null } | null,
): string => {
  if (!u) return "Account";
  if (u.displayName && u.displayName.trim()) return u.displayName.trim();
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (u.firstName && u.firstName.trim()) return u.firstName.trim();
  if (u.email) return u.email.split("@")[0];
  return "Account";
};

const initialOf = (name: string): string => {
  const first = name.trim().charAt(0);
  return (first || "?").toUpperCase();
};

const navigateTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const credits = useCredits();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = buildDisplayName(user);
  const email = user?.email || "";
  const initial = initialOf(displayName);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (signingOut) return;
    setSigningOut(true);
    setMenuOpen(false);
    try {
      await logout();
    } finally {
      // Even if the API call fails, AuthContext.logout() always clears local
      // state. Bounce to /login so the user isn't stranded on a protected page.
      navigateTo("/login");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-account-menu]")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl border-b border-white/[0.06]"
          : "border-b border-transparent",
      ].join(" ")}
      style={scrolled ? { backgroundColor: "rgba(10,10,12,0.78)" } : {}}
    >
      {/* Full-width nav with edge padding (no centered max-width) */}
      <nav className="px-6 sm:px-10 lg:px-12 h-[72px] flex items-center justify-between">
        {/* ─── BRAND + LOGO ──────────────────────────────────────────── */}
        <a
          href="/home"
          className="flex items-center gap-3 group"
          aria-label={`${BRAND_NAME} home`}
        >
          {/* Logo slot — image with sparkle fallback */}
          <span className="relative flex items-center justify-center">
            {/* Soft violet glow behind logo */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-violet-500/25 blur-lg group-hover:bg-violet-500/45 transition-all duration-300"
            />

            <span className="relative w-9 h-9 flex items-center justify-center">
              {!logoFailed ? (
                <img
                  src={LOGO_SRC}
                  alt={`${BRAND_NAME} logo`}
                  onError={() => setLogoFailed(true)}
                  className="img-bounce w-9 h-9 rounded-md object-contain"
                  draggable={false}
                />
              ) : (
                <SparkleIcon />
              )}
            </span>
          </span>

          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[16px] tracking-tight leading-none text-white">
              {BRAND_NAME}
            </span>
          </div>
        </a>

        {/* ─── RIGHT NAV ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          {/* Nav links removed — History + Documents now live in the
              home page's left sidebar with See-all CTAs. */}

          {/* Credits pill — only shown when authenticated */}
          {isAuthenticated && (
            <a
              href="/billing"
              title={credits.planName ? `Plan: ${credits.planName}` : "Credits"}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-all duration-200",
                "border bg-white/[0.03] hover:bg-white/[0.06]",
                // Low-balance warning style (< 5 credits and not unlimited and loaded)
                credits.balance !== null && !credits.unlimited && credits.balance < 5
                  ? "border-amber-400/40 text-amber-300 hover:border-amber-400/60"
                  : "border-violet-500/30 text-violet-200 hover:border-violet-500/55",
              ].join(" ")}
              aria-label="View billing and credit balance"
            >
              {credits.unlimited ? (
                <InfinityIcon size={13} strokeWidth={2.5} />
              ) : (
                <Coins size={13} strokeWidth={2.25} />
              )}
              <span className="leading-none">
                {credits.loading && credits.balance === null
                  ? "…"
                  : credits.balance === null
                    ? "—"
                    : credits.unlimited
                      ? "Unlimited"
                      : `${credits.balance} credits`}
              </span>
            </a>
          )}

          <div className="hidden sm:block w-px h-5 bg-white/[0.08] mx-2" />

          {/* Avatar + dropdown */}
          <div className="relative" data-account-menu>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full hover:bg-white/[0.04] transition-colors group"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              <span className="relative">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                    draggable={false}
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-[12px] font-bold text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]">
                    {initial}
                  </span>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-[2px] border-[#0a0a0c]"
                  aria-label="Online"
                />
              </span>
              <ChevronDown
                size={12}
                className={[
                  "text-white/40 group-hover:text-white/70 transition-all duration-200",
                  menuOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: "rgba(15,15,18,0.95)",
                  backdropFilter: "blur(20px)",
                }}
                role="menu"
              >
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {displayName}
                  </p>
                  {email && (
                    <p className="text-[11px] text-white/45 truncate">{email}</p>
                  )}
                </div>
                <div className="py-1">
                  <MenuItem href="/billing">
                    <span>Billing</span>
                    {credits.planName && (
                      <span className="ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">
                        {credits.planName}
                      </span>
                    )}
                  </MenuItem>
                  {/* <MenuItem href="/api-keys">API keys</MenuItem> */}
                </div>
                <div className="border-t border-white/[0.06] py-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-red-400/85 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors disabled:opacity-50"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ─── Helper: menu item ──────────────────────────────────────────────── */
function MenuItem({
  href,
  children,
  danger,
}: {
  href: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <a
      href={href}
      role="menuitem"
      className={[
        "flex items-center gap-2 px-4 py-2 text-[13px] transition-colors",
        danger
          ? "text-red-400/85 hover:text-red-300 hover:bg-red-500/[0.06]"
          : "text-white/70 hover:text-white hover:bg-white/[0.04]",
      ].join(" ")}
    >
      {children}
    </a>
  );
}