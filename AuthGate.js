"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Wrap any screen that should only be visible to a signed-in user.
// While Firebase is checking the session it shows a splash; if there's
// no user once the check finishes, it bounces to /login.
export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="w-full h-dvh max-w-app mx-auto flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-5xl animate-pulse">🕊️</div>
      </div>
    );
  }

  return children;
}
