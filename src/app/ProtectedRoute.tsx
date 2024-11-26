"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  console.log("accessToken", accessToken);

  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken
  );
  const expireTime = useSelector((state: RootState) => state.auth.expireTime);
  console.log("expireTime", expireTime);

  useEffect(() => {
    const checkAuth = () => {
      const currentTime = Date.now();
      // Validate expireTime
      const isValidExpireTime =
        typeof expireTime === "number" && expireTime > 0;

      if (!accessToken || !refreshToken) {
        router.push("/authentication/login");
      } else if (isValidExpireTime && currentTime > expireTime * 1000) {
        // Convert to milliseconds
        // Token has expired, you might want to refresh it here
        // For now, we'll just redirect to login
        router.push("/authentication/login");
      }
    };

    checkAuth();
  }, [accessToken, refreshToken, expireTime, router, pathname]);

  return <>{children}</>;
}
