import api from "./axiosInstance";
import { extractApiError } from "./authHelpers";

export const resetPassword = async ({ token, password }) => {
  try {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return { ok: true, message: data?.message || "Password reset successfully" };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};
