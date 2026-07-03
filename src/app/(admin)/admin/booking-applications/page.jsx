"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaEye, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

const computeJoinerTourStatus = (tour) => {
  const statuses = tour.bookings.map((b) => b.status);

  if (statuses.every((s) => s === "cancelled")) return "cancelled";
  if (statuses.every((s) => s === "refunded")) return "refunded";
  if (statuses.some((s) => s === "refunded")) return "refunded";
  if (statuses.every((s) => s === "completed")) return "completed";
  if (statuses.every((s) => s === "paid")) return "paid";

  return "ongoing";
};

const getBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "paid":
      return "text-green-600 bg-green-50";
    case "ongoing":
      return "text-blue-650 bg-blue-50";
    case "request":
      return "text-yellow-650 bg-yellow-50";
    case "cancelled":
    case "rejected":
      return "text-red-650 bg-red-50";
    case "refunded":
      return "text-amber-600 bg-amber-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
};

const formatPeso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminBookingApplicationsPage() {
  const { token } = useAuth();

  const [activeType, setActiveType] = useState("private"); // private | joiner
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (activeType === "private") {
        const res = await api.get("/booking/private/find-all");
        const normalized = res.data.map((b) => ({
          id: b.id,
          bookingType: "private",
          tour: b.tour?.title || "—",
          name: b.booker?.fullName || "—",
          email: b.booker?.email || "—",
          phone: b.booker?.phoneNumber || "—",
          participants: b.bookingIndividuals || 0,
          amount: b.amount || 0,
          status: b.status,
          createdAt: b.createdAt,
          raw: b,
        }));
        setBookings(normalized);
      } else if (activeType === "joiner") {
        const res = await api.get("/booking/joiner/find-all");
        const normalized = res.data.map((tour) => ({
          id: tour.id,
          bookingType: "joiner",
          tour: tour.title,
          participants: tour.joinerBookedSlots || 0,
          amount: tour.joinerPrice || 0,
          status: tour.status || "ongoing",
          createdAt: tour.createdAt,
          raw: tour,
        }));
        setBookings(normalized);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchBookings();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeType, token]);

  const updatePrivateStatus = async (id, status) => {
    const toastId = toast.loading("Updating booking status...");
    try {
      await api.put(`/booking/private/update-status/${id}`, { status });

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );

      setSelectedBooking((prev) => (prev ? { ...prev, status } : prev));
      toast.update(toastId, {
        render: `Status marked as ${status.toUpperCase()} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Failed to update booking status",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const updateJoinerStatus = async (tourId, status) => {
    const toastId = toast.loading("Updating all joiner statuses...");
    try {
      await api.patch(`/booking/joiner/update-status-to-paid/${tourId}`, {
        status,
      });

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== tourId) return b;
          return {
            ...b,
            status,
            raw: {
              ...b.raw,
              bookings: b.raw.bookings.map((j) => ({ ...j, status })),
            },
          };
        })
      );

      setSelectedBooking((prev) => {
        if (!prev || prev.id !== tourId) return prev;
        return {
          ...prev,
          status,
          raw: {
            ...prev.raw,
            bookings: prev.raw.bookings.map((j) => ({ ...j, status })),
          },
        };
      });

      toast.update(toastId, {
        render: "All joiners status updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Failed to update status",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const updateSingleJoinerStatus = async (bookingId, status) => {
    const toastId = toast.loading("Processing client refund...");
    try {
      await api.patch(`booking/update-status/${bookingId}`, {
        status: "refunded",
      });

      setSelectedBooking((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          raw: {
            ...prev.raw,
            bookings: prev.raw.bookings.map((j) =>
              j.id === bookingId ? { ...j, status } : j
            ),
          },
        };
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                status: computeJoinerTourStatus({
                  bookings: b.raw.bookings.map((j) =>
                    j.id === bookingId ? { ...j, status } : j
                  ),
                }),
              }
            : b
        )
      );

      toast.update(toastId, {
        render: "Client booking status refunded.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Failed to process refund",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filter === "all" ? true : b.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Bookings Management
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">Approve, update payment and review status of all applications</p>
      </div>

      {/* Filter Card */}
      <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold uppercase tracking-wider">
                Booking Type
              </label>
              <select
                value={activeType}
                onChange={(e) => {
                  setActiveType(e.target.value);
                  setFilter("all");
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none"
              >
                <option value="private">Private Custom Booking</option>
                <option value="joiner">Joiner Group Booking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold uppercase tracking-wider">
                Filter Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="request">Request</option>
                <option value="approved">Approved</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-750">ID</th>
                  <th className="p-4 font-bold text-gray-750">Tour Destination</th>
                  <th className="p-4 font-bold text-gray-750">Customer</th>
                  <th className="p-4 font-bold text-gray-750 text-center">Pax Slots</th>
                  <th className="p-4 font-bold text-gray-750 text-right">Amount</th>
                  <th className="p-4 font-bold text-gray-750">Status</th>
                  <th className="p-4 font-bold text-gray-750">Date</th>
                  <th className="p-4 font-bold text-gray-750 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
                      No bookings found matching filters.
                    </td>
                  </tr>
                )}

                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-55/50 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700">#{b.id}</td>
                    <td className="p-4 font-semibold text-gray-900">{b.tour}</td>
                    <td className="p-4">
                      {b.bookingType === "private" ? (
                        <div>
                          <span className="font-medium text-gray-800 block">{b.name}</span>
                          <span className="text-gray-400 text-xs">{b.email}</span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-primary">Joiner Group</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-600 font-medium">{b.participants}</td>
                    <td className="p-4 text-right font-bold text-gray-900">{formatPeso(b.amount)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{formatDateTime(b.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setDetailsOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-650 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none inline-flex items-center gap-1 font-bold text-xs"
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

      {/* ===== DETAILS DIALOG ===== */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-50">
              Booking Details Check
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-5 my-2 text-xs leading-relaxed text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <p><strong className="text-gray-800">Tour Package:</strong> {selectedBooking.tour}</p>
                <p><strong className="text-gray-800">Booking Type:</strong> {selectedBooking.bookingType?.toUpperCase()}</p>
                <p>
                  <strong className="text-gray-800">Status:</strong>{" "}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getBadgeClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </p>
                <p><strong className="text-gray-800">Total Amount:</strong> {formatPeso(selectedBooking.amount)}</p>
                <p><strong className="text-gray-800">Pax Slots:</strong> {selectedBooking.participants}</p>
              </div>

              {selectedBooking.bookingType === "private" && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                  <h6 className="font-bold text-gray-900 text-sm mb-2">Booker Information</h6>
                  <p><strong className="text-gray-750">Name:</strong> {selectedBooking.name}</p>
                  <p><strong className="text-gray-750">Email:</strong> {selectedBooking.email}</p>
                  <p><strong className="text-gray-750">Phone:</strong> {selectedBooking.phone}</p>

                  {/* Private Booking updates actions */}
                  <div className="pt-3 flex gap-2">
                    {selectedBooking.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => updatePrivateStatus(selectedBooking.id, "paid")}
                        className="bg-primary hover:bg-brand-dark font-bold text-xs"
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {selectedBooking.status === "refunded" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePrivateStatus(selectedBooking.id, "approved")}
                        className="font-bold text-xs"
                      >
                        Undo Action
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.bookingType === "joiner" && (
                <div className="space-y-4">
                  <h6 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-1.5">Registered Clients</h6>
                  <div className="overflow-x-auto max-h-40 border border-gray-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-2 font-bold text-gray-600">Name</th>
                          <th className="p-2 font-bold text-gray-600">Email</th>
                          <th className="p-2 font-bold text-gray-600">Phone</th>
                          <th className="p-2 font-bold text-gray-600">Status</th>
                          <th className="p-2 font-bold text-gray-600 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedBooking.raw.bookings?.map((j) => (
                          <tr key={j.id} className="hover:bg-gray-50">
                            <td className="p-2 font-semibold text-gray-800">{j.booker?.fullName}</td>
                            <td className="p-2 text-gray-500">{j.booker?.email}</td>
                            <td className="p-2 text-gray-500">{j.booker?.phoneNumber}</td>
                            <td className="p-2">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getBadgeClass(j.status)}`}>
                                {j.status}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              {j.status === "cancelled" && (
                                <button
                                  onClick={() => updateSingleJoinerStatus(j.id, "refunded")}
                                  className="px-2 py-1 text-[8px] font-extrabold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded cursor-pointer"
                                >
                                  Refund Client
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mass actions on entire group */}
                  <div className="flex gap-2 pt-2">
                    {selectedBooking.status === "completed" && (
                      <Button
                        size="sm"
                        onClick={() => updateJoinerStatus(selectedBooking.id, "paid")}
                        className="bg-primary hover:bg-brand-dark font-bold text-xs"
                      >
                        Mark All as Paid
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
