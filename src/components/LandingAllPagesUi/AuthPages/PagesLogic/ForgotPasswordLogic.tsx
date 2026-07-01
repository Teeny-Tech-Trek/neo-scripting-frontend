import { useState } from "react";
import type { FormEvent } from "react";
import ForgotPassword from "../PagesUi/ForgotPassword";
import { forgotPassword } from "../../../../services/auth/forgotPasswordService";
import { navigateTo } from "../../../../services/auth/authHelpers";
import { formatErrorMessage } from "../../../../services/apiError";

const ForgotPasswordLogic = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email.trim()) return;

    setIsSubmitting(true);
    setMessage("");
    const result = await forgotPassword(email.trim());
    setIsSubmitting(false);

    if (result.ok) {
      setStatus("success");
      setMessage(result.message || "If that email exists, a reset link has been sent.");
    } else {
      setStatus("error");
      setMessage(formatErrorMessage(result.error, "Could not send reset email. Try again."));
    }
  };

  return (
    <ForgotPassword
      email={email}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      status={status}
      message={message}
      onNavigateToLogin={() => navigateTo("/login")}
    />
  );
};

export default ForgotPasswordLogic;
