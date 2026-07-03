"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaUsers,
  FaUserClock,
  FaCalendarCheck,
  FaListAlt,
} from "react-icons/fa";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCoordinators: 0,
    totalApprovalCoordinators: 0,
    totalActiveBookings: 0,
    totalAllBookings: 0,
  });

  useEffect(() => {
    if (!token) return;

    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get("/auth/admin/dashboard");
        const data = res.data;

        setStats({
          totalCoordinators: data.totalCoordinators || 0,
          totalApprovalCoordinators: data.totalApprovalCoordinators || 0,
          totalActiveBookings: data.totalActiveBookings || 0,
          totalAllBookings: data.totalAllBookings || 0,
        });
      } catch (err) {
        console.error("Failed to load admin dashboard", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, [token]); // Bug #2 Fixed: includes proper reactive dependency arrays

  const statsCards = [
    {
      title: "Total Coordinators",
      value: stats.totalCoordinators,
      icon: FaUsers,
      bg: "bg-blue-450",
    },
    {
      title: "Pending Approval",
      value: stats.totalApprovalCoordinators,
      icon: FaUserClock,
      bg: "bg-yellow-450",
    },
    {
      title: "Active Bookings",
      value: stats.totalActiveBookings,
      icon: FaCalendarCheck,
      bg: "bg-green-450",
    },
    {
      title: "Total Bookings",
      value: stats.totalAllBookings,
      icon: FaListAlt,
      bg: "bg-purple-450",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Admin Dashboard
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">Overview of system operations and coordinators</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsCards.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card key={idx} className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-5 flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
                      {s.title}
                    </span>
                    <span className="text-gray-900 font-extrabold text-2xl leading-none block">
                      {s.value}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${s.bg}`}>
                    <Icon size={18} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
