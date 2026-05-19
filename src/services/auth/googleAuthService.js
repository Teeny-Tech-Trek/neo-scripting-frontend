import api from "./axiosInstance";
import { saveToken, saveUser, extractApiError } from "./authHelpers";

const GIS_SRC = "https://accounts.google.com/gsi/client";
let gisLoadPromise = null;

// Load Google Identity Services on demand so we don't ship the script
// to unauthenticated visitors who never click the Google button.
const loadGoogleIdentityScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    const onLoad = () => {
      if (window.google?.accounts?.id) resolve(window.google);
      else reject(new Error("Google Identity Services failed to initialise"));
    };
    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = onLoad;
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });

  return gisLoadPromise;
};

// Exchanges a Google ID token for our own session tokens.
export const exchangeGoogleIdToken = async (idToken) => {
  try {
    const { data } = await api.post("/auth/google", { idToken });
    if (data?.accessToken) saveToken(data.accessToken);
    if (data?.user) saveUser(data.user);
    return { ok: true, user: data?.user || null, accessToken: data?.accessToken || null };
  } catch (error) {
    return { ok: false, error: extractApiError(error) };
  }
};

// Triggers the GIS popup (One Tap fallback to button-prompt).
// `onResult` is called with the same shape `exchangeGoogleIdToken` returns.
export const signInWithGoogle = async (onResult) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    onResult({
      ok: false,
      error: {
        message: "Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID.",
        code: "GOOGLE_NOT_CONFIGURED",
      },
    });
    return;
  }

  try {
    const google = await loadGoogleIdentityScript();
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (!response?.credential) {
          onResult({
            ok: false,
            error: { message: "Google sign-in was cancelled", code: "GOOGLE_CANCELLED" },
          });
          return;
        }
        const result = await exchangeGoogleIdToken(response.credential);
        onResult(result);
      },
    });
    google.accounts.id.prompt();
  } catch (err) {
    onResult({
      ok: false,
      error: { message: err?.message || "Google sign-in failed", code: "GOOGLE_LOAD_FAILED" },
    });
  }
};
