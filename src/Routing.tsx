import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Navbar from "./components/LandingAllPagesUi/Navbar";
import HeroSection from "./components/LandingAllPagesUi/Hero";
import HowItWorks from "./components/LandingAllPagesUi/HowItWorks";
import AgentNetwork from "./components/LandingAllPagesUi/AgentNetwork";
import Footer from "./components/LandingAllPagesUi/Footer";
import LoginLogic from "./components/LandingAllPagesUi/AuthPages/PagesLogic/LoginLogic";
import SignupLogic from "./components/LandingAllPagesUi/AuthPages/PagesLogic/SignupLogic";
import ForgotPasswordLogic from "./components/LandingAllPagesUi/AuthPages/PagesLogic/ForgotPasswordLogic";
import ResetPasswordLogic from "./components/LandingAllPagesUi/AuthPages/PagesLogic/ResetPasswordLogic";
import VerifyEmailLogic from "./components/LandingAllPagesUi/AuthPages/PagesLogic/VerifyEmailLogic";
import NeoHome from "./components/NeoScript/pages/Home";
import NeoResult from "./components/NeoScript/pages/Result";
import NeoHistory from "./components/NeoScript/pages/History";
import NeoDocuments from "./components/NeoScript/pages/Documents";
import NeoBilling from "./components/NeoScript/pages/Billing";
import NeoDocs from "./components/NeoScript/pages/Docs";
import NewBriefDashboard from "./components/LandingAllPagesUi/Livedemopreview";
import ProtectedRoute from "./routes/ProtectedRoute";

interface RouteConfig {
  path: string;
  page: ReactNode;
}

const routes: RouteConfig[] = [
  {
    path: "/",
    page: (
      <>
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <AgentNetwork />
        <NewBriefDashboard />
        <Footer />
      </>
    ),
  },
  {
    path: "/login",
    page: (
      <>
        <Navbar />
        <LoginLogic />
        <Footer />
      </>
    ),
  },
  {
    path: "/get-started",
    page: (
      <>
        <Navbar />
        <SignupLogic />
        <Footer />
      </>
    ),
  },
  {
    path: "/forgot-password",
    page: (
      <>
        <Navbar />
        <ForgotPasswordLogic />
        <Footer />
      </>
    ),
  },
  {
    path: "/reset-password",
    page: (
      <>
        <Navbar />
        <ResetPasswordLogic />
        <Footer />
      </>
    ),
  },
  {
    path: "/verify-email",
    page: (
      <>
        <Navbar />
        <VerifyEmailLogic />
        <Footer />
      </>
    ),
  },
  {
    path: "/home",
    page: (
      <ProtectedRoute>
        <NeoHome />
      </ProtectedRoute>
    ),
  },
  {
    path: "/result",
    page: (
      <ProtectedRoute>
        <NeoResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    page: (
      <ProtectedRoute>
        <NeoHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/documents",
    page: (
      <ProtectedRoute>
        <NeoDocuments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/billing",
    page: (
      <ProtectedRoute>
        <NeoBilling />
      </ProtectedRoute>
    ),
  },
  {
    // Docs is intentionally PUBLIC — no ProtectedRoute. Anyone (including
    // anonymous landing-page visitors) should be able to read the docs.
    path: "/docs",
    page: <NeoDocs />,
  },
];

const findRoute = (pathname: string) =>
  routes.find((route) => route.path === pathname) ?? routes[0];

const getRoute = () => findRoute(window.location.pathname).page;

export default function Routing() {
  const [page, setPage] = useState(getRoute);

  useEffect(() => {
    const updatePage = () => setPage(getRoute());

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");

      if (!link) return;

      const url = new URL(link.href);
      const isSameOrigin = url.origin === window.location.origin;

      // Same-page hash link → smooth scroll, don't treat as route change
      if (
        isSameOrigin &&
        url.hash &&
        url.pathname === window.location.pathname
      ) {
        const el = document.querySelector(url.hash);
        if (el) {
          event.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState({}, "", url.pathname + url.hash);
        }
        return;
      }

      const isKnownRoute = routes.some((route) => route.path === url.pathname);

      if (!isSameOrigin || !isKnownRoute) return;

      event.preventDefault();
      // Preserve the hash on cross-page navigation (e.g. clicking /#agents
      // from /docs) so the next effect can scroll to it after mount.
      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      updatePage();

      // If the target path had a hash, scroll to it after the new page renders.
      // setTimeout gives React a tick to mount the new tree before we query.
      if (url.hash) {
        setTimeout(() => {
          const el = document.querySelector(url.hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }
    };

    window.addEventListener("popstate", updatePage);
    document.addEventListener("click", handleClick);

    // First-load scroll: if the URL has a hash (e.g. someone shares
    // https://neoscript/#agents) scroll to it once the DOM has mounted.
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }

    return () => {
      window.removeEventListener("popstate", updatePage);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return <>{page}</>;
}
