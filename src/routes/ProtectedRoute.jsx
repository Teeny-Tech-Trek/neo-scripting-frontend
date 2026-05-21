import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { navigateTo } from "../services/auth/authHelpers";

/**
 * Gate for app pages.
 *
 *   not logged in            →  /login
 *   logged in, unverified    →  /verify-email   (shows the "resend / open the link" UX)
 *   logged in, verified      →  render children
 *
 * The verified check is deliberately stricter than the server's. The Python
 * backend gates /generate and other credit-burning endpoints with
 * `require_verified_email`, but the rest of the app would still render — we
 * want the UI to refuse to let an unverified user past the door at all.
 */
const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const isVerified = !!user?.isEmailVerified;

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigateTo(redirectTo);
      return;
    }
    if (!isVerified) {
      navigateTo("/verify-email");
    }
  }, [loading, isAuthenticated, isVerified, redirectTo]);

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "#05050f" }}
      >
        <div
          className="w-10 h-10 rounded-full border-2"
          style={{
            borderColor: "rgba(168,85,247,0.25)",
            borderTopColor: "#a855f7",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || !isVerified) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
