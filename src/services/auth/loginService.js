import api from "./axiosInstance";
import { saveToken, saveUser, extractApiError } from "./authHelpers";

export const loginUser = async ({ email, password }) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    if (data?.accessToken) saveToken(data.accessToken);
    if (data?.user) saveUser(data.user);
    return { ok: true, user: data?.user || null, accessToken: data?.accessToken || null };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};
