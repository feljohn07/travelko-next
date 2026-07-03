"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { FaEye, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ManageCoordinatorsPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchApprovedCoordinators = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/admin/approved-coordinators");
        const coordinatorsData = Array.isArray(res.data) ? res.data : [];

        // Fetch tours count for each coordinator
        const coordinatorsWithTours = await Promise.all(
          coordinatorsData.map(async (c) => {
            try {
              const toursRes = await api.get(
                `/auth/admin/tours-created-by-coordinator/${c.id}`
              );
              return {
                id: c.id,
                name: c.fullName || "—",
                email: c.email || "—",
                tours: Array.isArray(toursRes.data) ? toursRes.data.length : 0,
                status: c.status || "Active",
              };
            } catch (err) {
              console.error(`Failed to fetch tours for coordinator ${c.id}`, err);
              return {
                id: c.id,
                name: c.fullName || "—",
                email: c.email || "—",
                tours: 0,
                status: c.status || "Active",
              };
            }
          })
        );

        setCoordinators(coordinatorsWithTours);
      } catch (err) {
        console.error("Failed to fetch approved coordinators:", err);
        toast.error("Failed to load coordinators list.");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedCoordinators();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Manage Coordinators
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">List and review all approved coordinators</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : coordinators.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <FaUsers size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-400 font-semibold text-sm">No approved coordinators found.</p>
        </div>
      ) : (
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-700">Coordinator Name</th>
                  <th className="p-4 font-bold text-gray-700">Email Address</th>
                  <th className="p-4 font-bold text-gray-700 text-center">Listed Tours</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-55">
                {coordinators.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{c.name}</td>
                    <td className="p-4 text-gray-550">{c.email}</td>
                    <td className="p-4 text-center font-bold text-primary">{c.tours}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-green-50 text-green-600">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/coordinator/${c.id}`)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-550 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none inline-flex items-center gap-1 font-bold text-xs"
                      >
                        <FaEye size={12} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
