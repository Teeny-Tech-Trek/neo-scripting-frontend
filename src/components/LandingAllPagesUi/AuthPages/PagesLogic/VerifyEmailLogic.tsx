import { useEffect, useRef, useState } from "react";
import VerifyEmail from "../PagesUi/VerifyEmail";
import { verifyEmail, resendVerification } from "../../../../services/auth/verificationService";
import { navigateTo } from "../../../../services/auth/authHelpers";
import { useAuth } from "../../../../context/AuthContext";

const VerifyEmailLogic = () => {
  const { isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  // Tracks the Continue button. Prevents double-clicks and lets us re-refresh
  // user state before navigating, so ProtectedRoute sees isEmailVerified=true.
  const [isContinuing, setIsContinuing] = useState(false);

  // React 18 StrictMode mounts effects twice in dev; one-shot guard so we
  // don't burn the token by hitting /verify-email twice.
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("missing");
      setMessage(
        isAuthenticated
          ? "Open the verification link from your email, or resend it below."
          : "Open the verification link from your email."
      );
      return;
    }

    (async () => {
      const result = await verifyEmail(token);
      if (!result.ok) {
        setStatus("error");
        setMessage(result.error?.message || "We couldn't verify this link. It may have expired.");
        return;
      }

      // Backend has flipped isEmailVerified=true in the DB. We MUST await the
      // user refresh here so ProtectedRoute sees the new value when the user
      // clicks Continue — otherwise they bounce right back to /verify-email.
      if (isAuthenticated) {
        try {
          await refreshUser();
        } catch {
          // Non-fatal — backend state is correct, we just couldn't sync the
          // client-side cache. The "Continue" handler will retry below.
        }
      }

      setStatus("success");
      setMessage(result.message || "Your email has been verified.");
    })();
  }, [isAuthenticated, refreshUser]);

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setResendMessage("");
    const result = await resendVerification();
    setIsResending(false);
    if (result.ok) {
      setResendStatus("success");
      setResendMessage(result.message || "Verification email sent. Check your inbox.");
    } else {
      setResendStatus("error");
      setResendMessage(result.error?.message || "Could not resend verification email.");
    }
  };

  // Defensive re-refresh + navigate. If the initial refreshUser raced or
  // failed, this catches up before ProtectedRoute reads isEmailVerified.
  // If the user isn't authenticated at all (clicked link in a different
  // browser / incognito), go to /login so they can sign in fresh.
  const handleContinue = async () => {
    if (isContinuing) return;
    setIsContinuing(true);
    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }
    try {
      await refreshUser();
    } catch {
      // Non-fatal; ProtectedRoute will retry the gate on /home.
    }
    navigateTo("/home");
  };

  return (
    <VerifyEmail
      status={status}
      message={message}
      onGoHome={handleContinue}
      onGoLogin={() => navigateTo("/login")}
      canResend={isAuthenticated && (status === "missing" || status === "error")}
      isResending={isResending}
      resendStatus={resendStatus}
      resendMessage={resendMessage}
      onResend={handleResend}
    />
  );
};

export default VerifyEmailLogic;
