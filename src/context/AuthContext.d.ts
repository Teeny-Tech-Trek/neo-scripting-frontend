import type { ReactNode } from "react";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
};

export type AuthError = {
  message: string;
  code: string;
  requestId?: string | null;
  status?: number;
  retryAfter?: number | null;
};

export type AuthActionResult = {
  ok: boolean;
  user?: AuthUser | null;
  accessToken?: string | null;
  error?: AuthError;
  message?: string;
};

export type LoginCredentials = { email: string; password: string };

export type SignupPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthActionResult>;
  signup: (data: SignupPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthActionResult>;
  applyAuthResult: (result: AuthActionResult) => void;
  setUser: (user: AuthUser | null) => void;
};

export const AuthProvider: (props: { children: ReactNode }) => JSX.Element;
export const useAuth: () => AuthContextValue;

declare const AuthContext: React.Context<AuthContextValue | null>;
export default AuthContext;
