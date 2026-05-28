import api from "./axiosInstance";
import { extractApiError } from "./authHelpers";

export const verifyEmail = async (token) => {
  try {
    const { data } = await api.get("/auth/verify-email", { params: { token } });
    return { ok: true, message: data?.message || "Email verified successfully" };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};

export const resendVerification = async () => {
  try {
    const { data } = await api.post("/auth/resend-verification", {});
    return { ok: true, message: data?.message || "Verification email sent" };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};
