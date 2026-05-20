import type { ReactNode } from "react";

declare const ProtectedRoute: (props: {
  children: ReactNode;
  redirectTo?: string;
}) => JSX.Element | null;

export default ProtectedRoute;
