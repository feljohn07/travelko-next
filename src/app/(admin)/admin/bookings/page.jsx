"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState("all");

  const [bookings, setBookings] = useState([
    {
      id: 1,
      tour: "Mt. Apo Climb",
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "09123400000",
      status: "Paid",
    },
    {
      id: 2,
      tour: "Mt. Apo Climb",
      name: "John Cruz",
      email: "john@email.com",
      phone: "0999999999",
      status: "Cancelled",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status.toLowerCase() === filter.toLowerCase());

  const getBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "text-green-600 bg-green-50";
      case "Cancelled":
        return "text-red-650 bg-red-50";
      case "Refunded":
        return "text-yellow-650 bg-yellow-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Tour Booking Management
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">Track and update statuses of client tour payments</p>
      </div>

      {/* Filter Options */}
      <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden w-fit">
        <CardContent className="p-4 flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-550 shrink-0">Filter Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none"
          >
            <option value="all">All bookings</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-750">ID</th>
                <th className="p-4 font-bold text-gray-750">Tour Package</th>
                <th className="p-4 font-bold text-gray-750">Customer</th>
                <th className="p-4 font-bold text-gray-750">Email</th>
                <th className="p-4 font-bold text-gray-750">Phone</th>
                <th className="p-4 font-bold text-gray-750">Status</th>
                <th className="p-4 font-bold text-gray-750 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-55">
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold">
                    No bookings found.
                  </td>
                </tr>
              )}

              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-extrabold text-gray-750">#{b.id}</td>
                  <td className="p-4 font-semibold text-gray-900">{b.tour}</td>
                  <td className="p-4 font-medium text-gray-800">{b.name}</td>
                  <td className="p-4 text-gray-500">{b.email}</td>
                  <td className="p-4 text-gray-500">{b.phone}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {b.status !== "Paid" && (
                        <button
                          onClick={() => updateStatus(b.id, "Paid")}
                          className="px-2.5 py-1 text-[10px] font-bold bg-green-50 text-green-650 rounded-lg hover:bg-green-100 cursor-pointer focus:outline-none"
                        >
                          Mark Paid
                        </button>
                      )}

                      {b.status !== "Cancelled" && (
                        <button
                          onClick={() => updateStatus(b.id, "Cancelled")}
                          className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-650 rounded-lg hover:bg-red-100 cursor-pointer focus:outline-none"
                        >
                          Cancel
                        </button>
                      )}

                      {b.status === "Paid" && (
                        <button
                          onClick={() => updateStatus(b.id, "Refunded")}
                          className="px-2.5 py-1 text-[10px] font-bold bg-yellow-50 text-yellow-650 rounded-lg hover:bg-yellow-100 cursor-pointer focus:outline-none"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
