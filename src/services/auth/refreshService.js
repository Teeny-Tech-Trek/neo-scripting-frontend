import api from "./axiosInstance";
import { saveToken, extractApiError } from "./authHelpers";

// Manual refresh helper. The axios interceptor handles the automatic
// 401 → refresh → retry flow; this is for callers (e.g. AuthContext bootstrap)
// that want to proactively obtain a fresh access token.
export const refreshAccessToken = async () => {
  try {
    const { data } = await api.post("/auth/refresh");
    if (data?.accessToken) saveToken(data.accessToken);
    return { ok: true, accessToken: data?.accessToken || null };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};
