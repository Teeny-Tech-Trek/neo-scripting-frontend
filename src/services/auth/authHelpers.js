// Browser-only persistence + tiny navigation helper shared by all auth services.
// localStorage is wrapped so private-browsing / quota errors never throw.

const TOKEN_KEY = "neo_access_token";
const USER_KEY = "neo_auth_user";

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const saveToken = (token) => safeStorage.set(TOKEN_KEY, token);
export const getToken = () => safeStorage.get(TOKEN_KEY);
export const removeToken = () => safeStorage.remove(TOKEN_KEY);

export const saveUser = (user) => safeStorage.set(USER_KEY, JSON.stringify(user));
export const getUser = () => {
  const raw = safeStorage.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
export const removeUser = () => safeStorage.remove(USER_KEY);

export const logoutUser = () => {
  removeToken();
  removeUser();
};

export const isAuthenticated = () => Boolean(getToken());

// The app uses a custom history-based router (see Routing.tsx);
// dispatching `popstate` causes it to re-evaluate the current path.
export const navigateTo = (path) => {
  if (typeof window === "undefined") return;
  if (window.location.pathname + window.location.search === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const extractApiError = (error) => {
  const apiErr = error?.response?.data?.error;
  if (apiErr?.message) {
    return { message: apiErr.message, code: apiErr.code || "UNKNOWN" };
  }
  if (error?.message === "Network Error") {
    return { message: "Cannot reach server. Check your connection.", code: "NETWORK_ERROR" };
  }
  return { message: error?.message || "Something went wrong", code: "UNKNOWN" };
};
