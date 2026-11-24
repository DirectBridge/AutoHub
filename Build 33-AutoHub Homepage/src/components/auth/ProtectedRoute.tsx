import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      const current = window.location.pathname + window.location.search;
      window.location.replace(`/login?redirect=${encodeURIComponent(current)}`);
    }
  }, [user]);
  return user ? <>{children}</> : null;
}
