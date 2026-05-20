import api from "./axiosInstance";
import { extractApiError } from "./authHelpers";

export const forgotPassword = async (email) => {
  try {
    const { data } = await api.post("/auth/forgot-password", { email });
    return { ok: true, message: data?.message || "If that email exists, a reset link has been sent" };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};
