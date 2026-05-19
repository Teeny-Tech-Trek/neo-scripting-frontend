import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  saveToken,
  saveUser,
  getToken,
  getUser,
  logoutUser as clearLocalAuth,
} from "../services/auth/authHelpers";
import { loginUser as apiLogin } from "../services/auth/loginService";
import { signupUser as apiSignup } from "../services/auth/signupService";
import { getCurrentUser, logoutCurrentUser } from "../services/auth/userService";
import { refreshAccessToken } from "../services/auth/refreshService";

const AuthContext = createContext(null);

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/get-started",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

export const AuthProvider = ({ children }) => {
  // Hydrate synchronously from localStorage so the first render of protected
  // pages doesn't flash the login screen.
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // On mount, ask the backend for the canonical user via /me.
  // If the token is expired but the httpOnly refresh cookie is valid,
  // the axios interceptor transparently rotates and retries.
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      const localToken = getToken();
      const currentPath = window.location.pathname;

      if (!localToken && PUBLIC_PATHS.has(currentPath)) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      // No access token at all: try a refresh, since the refresh cookie might still be alive.
      if (!localToken) {
        const refreshed = await refreshAccessToken();
        if (!refreshed.ok) {
          if (!cancelled) {
            setUser(null);
            setToken(null);
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setToken(refreshed.accessToken);
      }

      const result = await getCurrentUser();
      if (cancelled) return;
      if (result.ok && result.user) {
        setUser(result.user);
        setToken(getToken());
      } else {
        clearLocalAuth();
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await apiLogin(credentials);
    if (result.ok) {
      setUser(result.user);
      setToken(result.accessToken);
    }
    return result;
  }, []);

  const signup = useCallback(async (data) => {
    const result = await apiSignup(data);
    if (result.ok) {
      setUser(result.user);
      setToken(result.accessToken);
    }
    return result;
  }, []);

  // Used by the Google auth flow — service already saved token/user,
  // we just sync state.
  const applyAuthResult = useCallback((result) => {
    if (result?.ok && result.user) {
      setUser(result.user);
      setToken(result.accessToken || getToken());
      if (result.accessToken) saveToken(result.accessToken);
      saveUser(result.user);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutCurrentUser();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await getCurrentUser();
    if (result.ok && result.user) setUser(result.user);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
      refreshUser,
      applyAuthResult,
      setUser,
    }),
    [user, token, loading, login, signup, logout, refreshUser, applyAuthResult]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
