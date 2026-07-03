"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminNav from "@/components/AdminNav";

/**
 * Admin route group layout — Bug Fix #1:
 * The original project had NO auth protection on admin routes.
 * This layout checks both isLoggedIn AND role === "admin".
 */
export default function AdminLayout({ children }) {
  const { isLoggedIn, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || role !== "admin") {
      router.replace("/login");
    }
  }, [isLoggedIn, role, router]);

  if (!isLoggedIn || role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminNav />
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
