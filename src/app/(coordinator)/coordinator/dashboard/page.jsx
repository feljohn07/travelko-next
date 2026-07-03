"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStar,
} from "react-icons/fa";

export default function CoordinatorDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTours: 0,
    activeBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    if (!token) return;

    const fetchCoordinatorStats = async () => {
      try {
        const res = await api.get("auth/coordinator/stats");
        const data = res.data;

        setStats({
          totalTours: data.totalTours || 0,
          activeBookings: data.totalActiveBookings || 0,
          totalRevenue: Number(data.totalRevenue || 0),
          avgRating: data.averageRating || 0,
        });
      } catch (err) {
        console.error("Failed to load coordinator stats", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinatorStats();
  }, [token]);

  const statsCards = [
    {
      title: "Total Tours",
      value: stats.totalTours,
      sub: "Your published tours",
      icon: FaMapMarkerAlt,
      iconBg: "bg-blue-400",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      sub: "Ongoing bookings",
      icon: FaCalendarAlt,
      iconBg: "bg-green-450",
    },
    {
      title: "Total Revenue",
      value: `₱${stats.totalRevenue.toLocaleString()}`,
      sub: "All confirmed payments",
      icon: FaMoneyBillWave,
      iconBg: "bg-pink-400",
    },
    {
      title: "Customer Reviews",
      value: stats.avgRating,
      sub: "Average rating",
      icon: FaStar,
      iconBg: "bg-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Dashboard Overview
        </h2>
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
                    <span className="text-gray-400 text-[11px] font-medium block">
                      {s.sub}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${s.iconBg}`}>
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
