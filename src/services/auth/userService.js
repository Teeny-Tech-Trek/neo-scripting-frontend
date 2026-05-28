import api from "./axiosInstance";
import { saveUser, extractApiError, logoutUser } from "./authHelpers";

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/auth/me");
    if (data?.user) saveUser(data.user);
    return { ok: true, user: data?.user || null };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};

export const logoutCurrentUser = async () => {
  try {
    await api.post("/auth/logout", {});
  } catch {
    // Even if the backend call fails (already expired token, network error, etc.)
    // we still want the client cleared.
  } finally {
    logoutUser();
  }
  return { ok: true };
};
