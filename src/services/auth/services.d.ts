import type { AuthActionResult } from "../../context/AuthContext";

declare module "./loginService" {
  export const loginUser: (data: { email: string; password: string }) => Promise<AuthActionResult>;
}

declare module "./signupService" {
  export const signupUser: (data: Record<string, unknown>) => Promise<AuthActionResult>;
}

declare module "./googleAuthService" {
  export const exchangeGoogleIdToken: (idToken: string) => Promise<AuthActionResult>;
  export const signInWithGoogle: (onResult: (result: AuthActionResult) => void) => Promise<void>;
}

declare module "./forgotPasswordService" {
  export const forgotPassword: (email: string) => Promise<AuthActionResult>;
}

declare module "./resetPasswordService" {
  export const resetPassword: (data: { token: string; password: string }) => Promise<AuthActionResult>;
}

declare module "./verificationService" {
  export const verifyEmail: (token: string) => Promise<AuthActionResult>;
  export const resendVerification: () => Promise<AuthActionResult>;
}

declare module "./refreshService" {
  export const refreshAccessToken: () => Promise<AuthActionResult>;
}

declare module "./userService" {
  export const getCurrentUser: () => Promise<AuthActionResult>;
  export const logoutCurrentUser: () => Promise<{ ok: boolean }>;
}
