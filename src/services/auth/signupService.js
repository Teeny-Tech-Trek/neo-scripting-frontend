import api from "./axiosInstance";
import { saveToken, saveUser, extractApiError } from "./authHelpers";

export const signupUser = async (data) => {
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
  };

  try {
    const { data: res } = await api.post("/auth/register", payload);
    if (res?.accessToken) saveToken(res.accessToken);
    if (res?.user) saveUser(res.user);
    return { ok: true, user: res?.user || null, accessToken: res?.accessToken || null };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};
