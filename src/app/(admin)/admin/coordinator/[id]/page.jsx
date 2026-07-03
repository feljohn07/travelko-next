"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

export default function CoordinatorDetailsPage({ params: paramsPromise }) {
  const router = useRouter();
  const { token } = useAuth();
  
  // Await the params Promise in Next.js 15
  const params = use(paramsPromise);
  const { id } = params;

  const [coordinator, setCoordinator] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch coordinator details
        const coordRes = await api.get(`/auth/admin/approved-coordinators`);
        const found = coordRes.data.find((c) => String(c.id) === String(id));
        setCoordinator(found);

        // Fetch tours created by coordinator
        const tourRes = await api.get(
          `/auth/admin/tours-created-by-coordinator/${id}`
        );
        setTours(Array.isArray(tourRes.data) ? tourRes.data : []);
      } catch (err) {
        console.error("Failed to load details", err);
        toast.error("Failed to load coordinator details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const deleteCoordinator = async () => {
    toast(
      ({ closeToast }) => (
        <div className="p-1">
          <p className="font-bold text-sm text-gray-900 mb-2">Delete this coordinator profile?</p>
          <p className="text-xs text-gray-500 mb-4">This action will remove their account permanently.</p>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={closeToast}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                closeToast();
                try {
                  await api.delete(`/auth/admin/delete-coordinator/${id}`);
                  toast.success("🗑️ Coordinator deleted successfully.");
                  router.push("/admin/coordinators");
                } catch (err) {
                  console.error(err);
                  toast.error("❌ Failed to delete coordinator.");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  const formatPeso = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!coordinator) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
        <p className="text-gray-400 font-semibold mb-4">Coordinator details not found.</p>
        <Button onClick={() => router.push("/admin/coordinators")} className="px-4 py-2 text-xs font-bold bg-primary hover:bg-brand-dark">
          <FaArrowLeft className="mr-1" /> Back to List
        </Button>
      </div>
    );
  }

  const toursWithRevenue = tours.map((t) => {
    const bookings = t.totalBookings || t.joinerBookedSlots || 0;
    const revenue = bookings * (t.joinerPrice || 0);
    return { ...t, bookings, revenue };
  });

  const totalRevenue = toursWithRevenue.reduce((sum, t) => sum + t.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-150">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/coordinators")}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-gray-500 focus:outline-none"
          >
            <FaArrowLeft size={12} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Coordinator Information
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">Details and revenue performance metrics</p>
          </div>
        </div>

        <Button
          onClick={deleteCoordinator}
          variant="destructive"
          className="px-4 py-2 text-xs font-bold cursor-pointer"
        >
          <FaTrash className="mr-1.5" /> Delete Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden lg:col-span-1 h-fit">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center pb-4 border-b border-gray-50">
              {coordinator.profileImageUrl ? (
                <img
                  src={coordinator.profileImageUrl}
                  alt="Profile"
                  className="rounded-full object-cover border shadow-sm w-24 h-24 mb-4"
                />
              ) : (
                <div className="rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-3xl w-24 h-24 mb-4">
                  {coordinator.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <h4 className="font-extrabold text-gray-900 text-lg leading-tight">{coordinator.fullName}</h4>
              <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-extrabold uppercase rounded-full">
                {coordinator.status || "Active"}
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-600">
              <p><strong className="text-gray-800">Email:</strong> {coordinator.email}</p>
              <p><strong className="text-gray-800">Phone:</strong> {coordinator.phoneNumber || "—"}</p>
              <p><strong className="text-gray-800">Gender:</strong> {coordinator.gender || "—"}</p>
              <p><strong className="text-gray-800">Address:</strong> {coordinator.address || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tours and revenue listed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <h4 className="font-extrabold text-gray-900 text-base mb-4">Listed Tour Packages</h4>

              {toursWithRevenue.length === 0 ? (
                <p className="text-gray-400 text-xs italic py-4">No tour packages listed under this coordinator.</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-3 font-bold text-gray-700">Tour Destination</th>
                          <th className="p-3 font-bold text-gray-700 text-center">Bookings Count</th>
                          <th className="p-3 font-bold text-gray-700 text-center">Max Slots</th>
                          <th className="p-3 font-bold text-gray-700 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {toursWithRevenue.map((tour) => (
                          <tr key={tour.id}>
                            <td className="p-3 font-semibold text-gray-800">{tour.title}</td>
                            <td className="p-3 text-center font-bold text-gray-750">{tour.bookings}</td>
                            <td className="p-3 text-center text-gray-500">{tour.joinerMaxSlots}</td>
                            <td className="p-3 text-right font-bold text-gray-950">{formatPeso(tour.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end items-center pt-4 border-t border-gray-55 text-sm">
                    <span className="text-gray-450 font-bold mr-2">Total Accumulated Revenue:</span>
                    <span className="text-primary font-extrabold text-base">{formatPeso(totalRevenue)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
