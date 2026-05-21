import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// ── apni logo image yahan import karo ──
// import logoImg from "@/Images/neo-scripting-logo.png";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Use absolute paths so these work from /docs (or anywhere else) — when
  // the user is on /, the router treats `/#agents` as a same-page hash and
  // smooth-scrolls. From /docs it navigates to / and scrolls after mount.
  const navLinks = [
    { name: "Docs", href: "/docs" },
    { name: "Agents", href: "/#agents" },
    { name: "Demo", href: "/#demo" },
  ];

  return (
    <>
   

      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,5,15,0.85)" : "rgba(5,5,15,0)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(96,165,250,0.10)"
            : "1px solid transparent",
        }}
      >
        <div className="container mx-auto px-10 lg:px-16">
          {/*
            ⚠️ FIX: Use proper flex with flex-1 on nav links instead of absolute centering.
            Pehle absolute positioning use ki thi jisse Blog/Sign In overlap ho rahe the.
          */}
          <div className="flex items-center justify-between h-24 gap-6">
            {/* ════════════ LOGO ════════════ */}
            <motion.a
              href="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex items-center gap-3 flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-20 h-20 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <img
                  src="/logo.png"
                  alt="Neo Scripting"
                  className="w-20 h-20 object-contain"
                  draggable={false}
                />
              </motion.div>

              <h1 className="nav-font font-extrabold text-2xl tracking-tight leading-none whitespace-nowrap font-syne-bold">
                <span className="text-white">Neo </span>
                 <span
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Scripting
            </span>
              </h1>
            </motion.a>

            {/* ════════════ DESKTOP NAV LINKS — flex-1 properly centered ════════════ */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="hidden lg:flex flex-1 items-center justify-center gap-7 xl:gap-9 nav-body"
            >
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.06, duration: 0.4 }}
                  whileHover={{ y: -1 }}
                  className="relative text-[15px] font-medium text-white/75 hover:text-white transition-colors group whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute -bottom-1.5 left-1/2 w-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300" />
                </motion.a>
              ))}
            </motion.div>

            {/* ════════════ DESKTOP CTA ════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="hidden lg:flex items-center gap-3 nav-body flex-shrink-0"
            >
              <motion.a
                href="/login"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-2.5 rounded-full text-[15px] font-medium text-white transition-all whitespace-nowrap"
                style={{
                  background: "rgba(15,15,30,0.6)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                Sign In
              </motion.a>

              <motion.a
                href="/get-started"
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 0 35px rgba(59,130,246,0.55)",
                }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 pl-6 pr-5 py-2.5 rounded-full text-[15px] font-semibold text-white whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                  boxShadow: "0 0 22px rgba(59,130,246,0.4)",
                }}
              >
                Get Started Free
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </motion.a>
            </motion.div>

            {/* ════════════ MOBILE BUTTON ════════════ */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-colors flex-shrink-0"
              style={{
                background: "rgba(15,15,30,0.6)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* ════════════ MOBILE MENU ════════════ */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
              style={{
                background: "rgba(5,5,15,0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(96,165,250,0.15)",
              }}
            >
              <div className="container mx-auto px-6 py-5 flex flex-col gap-1 nav-body">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    {link.name}
                  </motion.a>
                ))}

                <div
                  className="my-3 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  }}
                />

                <div className="flex flex-col gap-2">
                  <a
                    href="/login"
                    className="w-full text-center py-3 rounded-full text-[15px] font-medium text-white"
                    style={{
                      background: "rgba(15,15,30,0.6)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    Sign In
                  </a>
                  <a
                    href="/get-started"
                    className="w-full text-center py-3 rounded-full text-[15px] font-semibold text-white inline-flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                      boxShadow: "0 0 22px rgba(59,130,246,0.4)",
                    }}
                  >
                    Get Started Free
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
