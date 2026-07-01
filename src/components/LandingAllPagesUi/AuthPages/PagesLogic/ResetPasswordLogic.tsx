import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import ResetPassword from "../PagesUi/ResetPassword";
import { resetPassword } from "../../../../services/auth/resetPasswordService";
import { navigateTo } from "../../../../services/auth/authHelpers";
import { formatErrorMessage } from "../../../../services/apiError";

const ResetPasswordLogic = () => {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !token) return;

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    // Backend rule: 8+ chars, must contain upper, lower, and number.
    const pwRule = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,128}$/;
    if (!pwRule.test(password)) {
      setStatus("error");
      setMessage("Password must be 8+ chars and include uppercase, lowercase, and a number.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    const result = await resetPassword({ token, password });
    setIsSubmitting(false);

    if (result.ok) {
      setStatus("success");
      setMessage(result.message || "Password reset successfully. Redirecting to sign in...");
      setTimeout(() => navigateTo("/login"), 1800);
    } else {
      setStatus("error");
      setMessage(formatErrorMessage(result.error, "Could not reset password."));
    }
  };

  return (
    <ResetPassword
      password={password}
      onPasswordChange={setPassword}
      confirmPassword={confirmPassword}
      onConfirmPasswordChange={setConfirmPassword}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword((p) => !p)}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      status={status}
      message={message}
      tokenMissing={token === null || token === ""}
    />
  );
};

export default ResetPasswordLogic;
