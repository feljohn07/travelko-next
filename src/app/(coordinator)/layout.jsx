"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CoordinatorNav from "@/components/CoordinatorNav";

export default function CoordinatorLayout({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Collapsed state default true matching original Vite project
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || !isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CoordinatorNav
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
      />
      {/* Shift content based on sidebar collapsed state */}
      <main
        className={`flex-1 p-4 transition-all duration-200 ${
          collapsed ? "md:pl-[88px]" : "md:pl-[246px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
