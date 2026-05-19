import type { AuthUser, AuthError } from "../../context/AuthContext";

export const saveToken: (token: string) => void;
export const getToken: () => string | null;
export const removeToken: () => void;
export const saveUser: (user: AuthUser) => void;
export const getUser: () => AuthUser | null;
export const removeUser: () => void;
export const logoutUser: () => void;
export const isAuthenticated: () => boolean;
export const navigateTo: (path: string) => void;
export const extractApiError: (error: unknown) => AuthError;
