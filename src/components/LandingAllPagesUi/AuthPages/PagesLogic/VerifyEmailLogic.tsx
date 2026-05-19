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
      if (result.ok) {
        setStatus("success");
        setMessage(result.message || "Your email has been verified.");
        if (isAuthenticated) refreshUser();
      } else {
        setStatus("error");
        setMessage(result.error?.message || "We couldn't verify this link. It may have expired.");
      }
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

  return (
    <VerifyEmail
      status={status}
      message={message}
      onGoHome={() => navigateTo(isAuthenticated ? "/home" : "/login")}
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
