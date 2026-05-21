import { useState } from "react";
import type { FormEvent } from "react";
import Login from "../PagesUi/Login";
import { useAuth } from "../../../../context/AuthContext";
import type { AuthActionResult } from "../../../../context/AuthContext";
import { signInWithGoogle } from "../../../../services/auth/googleAuthService";
import { navigateTo } from "../../../../services/auth/authHelpers";

const LoginLogic = () => {
  const { login, applyAuthResult } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => setShowPassword((p) => !p);
  const toggleRememberMe = () => setRememberMe((r) => !r);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.ok) {
      // Unverified users land on /verify-email so they see the resend UX
      // instead of bouncing through /home → /verify-email via ProtectedRoute.
      const target = result.user?.isEmailVerified ? "/home" : "/verify-email";
      navigateTo(target);
    } else {
      setErrorMessage(result.error?.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleSignIn = () => {
    if (isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);
    signInWithGoogle((result: AuthActionResult) => {
      setIsSubmitting(false);
      if (result.ok) {
        applyAuthResult(result);
        const target = result.user?.isEmailVerified ? "/home" : "/verify-email";
        navigateTo(target);
      } else {
        setErrorMessage(result.error?.message || "Google sign-in failed.");
      }
    });
  };

  const handleForgotPassword = () => navigateTo("/forgot-password");

  return (
    <Login
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      showPassword={showPassword}
      onTogglePassword={togglePasswordVisibility}
      rememberMe={rememberMe}
      onToggleRememberMe={toggleRememberMe}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onGoogleSignIn={handleGoogleSignIn}
      onForgotPassword={handleForgotPassword}
    />
  );
};

export default LoginLogic;
