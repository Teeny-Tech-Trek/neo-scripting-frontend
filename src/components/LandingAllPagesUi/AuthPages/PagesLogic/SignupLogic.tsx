import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Signup from "../PagesUi/Signup";
import { useAuth } from "../../../../context/AuthContext";
import type { AuthActionResult } from "../../../../context/AuthContext";
import { signInWithGoogle } from "../../../../services/auth/googleAuthService";
import { navigateTo } from "../../../../services/auth/authHelpers";

export type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormData: SignupFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,128}$/;

const SignupLogic = () => {
  const { signup, applyAuthResult } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((p) => !p);

  const navigateToLogin = () => navigateTo("/login");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");

    if (!PASSWORD_RULE.test(formData.password)) {
      setSubmitStatus("error");
      setErrorMessage("Password must be 8+ chars and include uppercase, lowercase, and a number.");
      setTimeout(() => setSubmitStatus("idle"), 3500);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitStatus("error");
      setErrorMessage("Password and confirm password do not match.");
      setTimeout(() => setSubmitStatus("idle"), 3500);
      return;
    }

    setIsSubmitting(true);
    const result = await signup(formData);
    setIsSubmitting(false);

    if (result.ok) {
      setSubmitStatus("success");
      setTimeout(() => navigateTo("/home"), 800);
    } else {
      setSubmitStatus("error");
      setErrorMessage(result.error?.message || "Signup failed. Please try again.");
      setTimeout(() => setSubmitStatus("idle"), 3500);
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
        setSubmitStatus("success");
        setTimeout(() => navigateTo("/home"), 600);
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error?.message || "Google sign-in failed.");
        setTimeout(() => setSubmitStatus("idle"), 3500);
      }
    });
  };

  return (
    <Signup
      formData={formData}
      onChange={handleChange}
      showPassword={showPassword}
      onTogglePassword={togglePasswordVisibility}
      showConfirmPassword={showConfirmPassword}
      onToggleConfirmPassword={toggleConfirmPasswordVisibility}
      isSubmitting={isSubmitting}
      submitStatus={submitStatus}
      onSubmit={handleSubmit}
      onNavigateToLogin={navigateToLogin}
      onGoogleSignIn={handleGoogleSignIn}
      errorMessage={errorMessage}
    />
  );
};

export default SignupLogic;
