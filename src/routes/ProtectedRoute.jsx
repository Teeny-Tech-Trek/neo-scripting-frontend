import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { navigateTo } from "../services/auth/authHelpers";

const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigateTo(redirectTo);
    }
  }, [loading, isAuthenticated, redirectTo]);

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

  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
