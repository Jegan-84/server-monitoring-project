"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "./ProtectedRoute";

const publicPaths = [
  "/authentication/login",
  "/authentication/register",
  "/forget-password",
];

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname();

  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
