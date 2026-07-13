"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaSearch, FaEye, FaCheck, FaTimes, FaBan } from "react-icons/fa";
import { toast } from "react-toastify";

const formatPeso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "paid":
    case "completed":
      return "text-green-650 bg-green-50";
    case "request":
      return "text-yellow-650 bg-yellow-50";
    case "cancelled":
    case "rejected":
      return "text-red-650 bg-red-50";
    case "upcoming":
    case "ongoing":
      return "text-blue-650 bg-blue-50";
    default:
      return "text-gray-550 bg-gray-50";
  }
};

export default function BookingsPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approval"); // approval | private | joiner
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        let endpoint = "";
        if (activeTab === "private") {
          endpoint = "/booking/all/statuses";
        } else if (activeTab === "joiner") {
          endpoint = "/tours/all/statuses";
        }

        if (endpoint) {
          const res = await api.get(endpoint);
          setStatuses(Array.isArray(res.data) ? res.data : []);
        } else {
          setStatuses([]);
        }
      } catch (err) {
        console.error("Failed to fetch statuses, using fallback.", err);
        const fallback =
          activeTab === "private"
            ? ["request", "approved", "cancelled", "rejected"]
            : ["draft", "upcoming", "ongoing", "completed"];
        setStatuses(fallback);
      }
    };

    if (token) {
      fetchStatuses();
    }
  }, [activeTab, token]);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveBooking, setApproveBooking] = useState(null);
  const [approvePrice, setApprovePrice] = useState("");
  const [approveRemarks, setApproveRemarks] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectBooking, setRejectBooking] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [clientsModalOpen, setClientsModalOpen] = useState(false);
  const [selectedTourClients, setSelectedTourClients] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetailModal, setClientDetailModal] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint =
        activeTab === "joiner" ? "booking/tours/joiners" : "booking/tours/private";

      const res = await api.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : [];

      let normalized = [];
      if (activeTab === "joiner") {
        normalized = data.map((tour) => ({
          mode: "joiner",
          tourId: tour.id,
          tourTitle: tour.title || "—",
          category: tour.category || "—",
          joinerPrice: tour.joinerPrice || 0,
          joinerBookedSlots: tour.joinerBookedSlots || 0,
          joinerMaxSlots: tour.joinerMaxSlots || 0,
          status: tour.status || "ongoing",
          bookings: tour.bookings || [],
        }));
      } else {
        normalized = data.map((b) => ({
          mode: "private",
          id: b.id,
          tourId: b.tour?.id,
          tourTitle: b.tour?.title || "—",
          customer: b.booker?.fullName ?? "—",
          email: b.booker?.email ?? "—",
          phone: b.booker?.phoneNumber ?? "—",
          address: b.booker?.address ?? "—",
          tourDate: Array.isArray(b.bookingDateSelected)
            ? `${new Date(b.bookingDateSelected[0]).toLocaleDateString()} - ${
                b.bookingDateSelected[1]
                  ? new Date(b.bookingDateSelected[1]).toLocaleDateString()
                  : ""
              }`
            : "—",
          type: b.bookingType,
          amount: Number(b.amount),
          status: b.status,
          displayStatus: b.status,
          remarks: b.remarks,
          specialRequests: b.specialRequests,
        }));
      }
      setBookings(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
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
  }, [activeTab, token]);

  const dataToRender = useMemo(() => {
    let filtered = bookings;

    if (activeTab === "approval") {
      filtered = filtered.filter(
        (b) => b.type === "private" && b.status === "request"
      );
    } else if (activeTab === "private") {
      filtered = filtered.filter((b) => b.type === "private");
    }

    if (statusFilter !== "all" && activeTab !== "approval") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter((b) =>
        b.customer?.toLowerCase().includes(search.toLowerCase()) ||
        b.tourTitle?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [bookings, activeTab, statusFilter, search]);

  const handleView = async (b) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      setSelectedBooking(b);

      const res = await api.get(`/tours/${b.tourId}`);
      setSelectedTour(res.data);
    } catch (err) {
      console.error("Failed to load tour info details", err);
    } finally {
      setViewLoading(false);
    }
  };

  const approvePrivate = async () => {
    if (!approvePrice || isNaN(approvePrice)) {
      toast.warning("Please enter a valid price");
      return;
    }

    setApproveLoading(true);
    try {
      await api.put(`/booking/private/approve/${approveBooking.id}`, {
        price: Number(approvePrice),
        remarks: approveRemarks || "",
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === approveBooking.id
            ? {
                ...b,
                status: "approved",
                displayStatus: "approved",
                amount: Number(approvePrice),
              }
            : b
        )
      );

      toast.success("Private booking approved! 🎉");
      setApproveModalOpen(false);
      setApproveBooking(null);
      setApproveRemarks("");
    } catch (err) {
      console.error(err);
      toast.error("Approval failed.");
    } finally {
      setApproveLoading(false);
    }
  };

  const rejectPrivate = async () => {
    if (!rejectRemarks || rejectRemarks.trim().length < 10) {
      setRejectError("Remarks must be at least 10 characters long.");
      return;
    }

    setRejectLoading(true);
    setRejectError("");

    try {
      await api.put(`/booking/private/reject/${rejectBooking.id}`, {
        remarks: rejectRemarks.trim(),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === rejectBooking.id ? { ...b, status: "cancelled", displayStatus: "cancelled" } : b
        )
      );

      toast.success("Booking rejected.");
      setRejectModalOpen(false);
      setRejectBooking(null);
      setRejectRemarks("");
    } catch (err) {
      setRejectError(err.response?.data?.message || "Failed to reject booking.");
    } finally {
      setRejectLoading(false);
    }
  };

  const cancelPrivate = async () => {
    if (!cancelRemarks || cancelRemarks.trim().length < 10) {
      setCancelError("Remarks must be at least 10 characters long.");
      return;
    }

    setCancelLoading(true);
    setCancelError("");

    try {
      await api.put(`/booking/cancel/${cancelBooking.id}/private`, {
        remarks: cancelRemarks.trim(),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelBooking.id
            ? { ...b, status: "cancelled", displayStatus: "cancelled" }
            : b
        )
      );

      toast.success("Private booking cancelled successfully.");
      setCancelModalOpen(false);
      setCancelBooking(null);
      setCancelRemarks("");
    } catch (err) {
      setCancelError(
        err.response?.data?.message || "Failed to cancel booking."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const cancelJoinerBookings = async (tourId) => {
    try {
      await api.patch(`/booking/cancel/${tourId}/joiners`, {});

      // Bug #8 Fixed: dynamic update resets joinerBookedSlots back to 0 inside setBookings loop
      setBookings((prev) =>
        prev.map((tour) =>
          tour.tourId === tourId
            ? {
                ...tour,
                joinerBookedSlots: 0,
                bookings: tour.bookings.map((b) => ({
                  ...b,
                  status: "cancelled",
                })),
              }
            : tour
        )
      );

      toast.success("All joiner bookings cancelled successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel group bookings.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Bookings Management
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">Search, review, and confirm coordinator bookings</p>
      </div>

      {/* Filter Card */}
      <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 align-items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">View Category</label>
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setStatusFilter("all");
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none"
              >
                <option value="approval">Private Approval Requests</option>
                <option value="private">Private Bookings</option>
                <option value="joiner">Joiner Group Bookings</option>
              </select>
            </div>

            {activeTab !== "approval" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none"
                >
                  <option value="all">All</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Search Clients</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customer name or tour..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
                />
                <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={12} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table view */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : activeTab !== "joiner" ? (
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-700">Booking Ref</th>
                  <th className="p-4 font-bold text-gray-700">Customer</th>
                  <th className="p-4 font-bold text-gray-700">Tour Date</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Amount</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataToRender.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-gray-800 block">#{b.id}</span>
                      <span className="text-gray-400 text-xs">{b.tourTitle}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{b.customer}</td>
                    <td className="p-4 text-gray-550">{b.tourDate}</td>
                    <td className="p-4 text-right font-bold text-gray-900">{formatPeso(b.amount)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(b.displayStatus)}`}>
                        {b.displayStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(b)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-650 hover:bg-gray-50 cursor-pointer focus:outline-none"
                          title="View Details"
                        >
                          <FaEye size={12} />
                        </button>

                        {activeTab === "approval" && (
                          <>
                            <button
                              onClick={() => {
                                setApproveBooking(b);
                                setApprovePrice("");
                                setApproveRemarks("");
                                setApproveModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer focus:outline-none"
                              title="Approve"
                            >
                              <FaCheck size={12} />
                            </button>
                            <button
                              onClick={() => {
                                setRejectBooking(b);
                                setRejectRemarks("");
                                setRejectError("");
                                setRejectModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer focus:outline-none"
                              title="Reject"
                            >
                              <FaTimes size={12} />
                            </button>
                          </>
                        )}

                        {activeTab === "private" &&
                          (b.status === "approved" ||
                            b.status === "upcoming" ||
                            b.status === "paid") && (
                            <button
                              onClick={() => {
                                setCancelBooking(b);
                                setCancelRemarks("");
                                setCancelError("");
                                setCancelModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer focus:outline-none"
                              title="Cancel Booking"
                            >
                              <FaBan size={12} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
                {dataToRender.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 font-medium">
                      No private bookings found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Joiner Table Mode */
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-700">Tour</th>
                  <th className="p-4 font-bold text-gray-700">Category</th>
                  <th className="p-4 font-bold text-gray-700 text-center">Booked Slots</th>
                  <th className="p-4 font-bold text-gray-700 text-center">Max Slots</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataToRender.map((tour) => (
                  <tr key={tour.tourId} className="hover:bg-gray-55/50 transition-colors">
                    <td className="p-4 font-extrabold text-gray-900">{tour.tourTitle}</td>
                    <td className="p-4 text-gray-555">{tour.category}</td>
                    <td className="p-4 text-center font-bold text-primary">{tour.joinerBookedSlots}</td>
                    <td className="p-4 text-center text-gray-600">{tour.joinerMaxSlots}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(tour.status)}`}>
                        {tour.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedTourClients(tour);
                            setClientsModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-brand-dark transition-colors cursor-pointer"
                        >
                          View Clients
                        </button>
                        <button
                          disabled={!tour.joinerBookedSlots}
                          onClick={() => cancelJoinerBookings(tour.tourId)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-650 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Cancel All Joiners
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {dataToRender.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 font-medium">
                      No group tour slots booked.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===== VIEW BOOKING DETAILS DIALOG ===== */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 border-b border-gray-50 pb-2">
              Booking Details
            </DialogTitle>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex flex-col items-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
              <p className="text-gray-400 text-xs">Loading details...</p>
            </div>
          ) : (
            selectedBooking && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 my-2 leading-relaxed">
                <div className="space-y-2">
                  <h6 className="font-bold text-gray-900 text-sm mb-3">
                    {selectedTour?.title || selectedBooking.tourTitle}
                  </h6>
                  <p><strong className="text-gray-800">Customer:</strong> {selectedBooking.customer}</p>
                  <p><strong className="text-gray-800">Email:</strong> {selectedBooking.email}</p>
                  <p><strong className="text-gray-800">Phone:</strong> {selectedBooking.phone}</p>
                  <p><strong className="text-gray-800">Address:</strong> {selectedBooking.address}</p>
                  <p><strong className="text-gray-800">Tour Date:</strong> {selectedBooking.tourDate}</p>
                  <p><strong className="text-gray-800">Type:</strong> {selectedBooking.type}</p>
                  <p><strong className="text-gray-800">Special Request:</strong> {selectedBooking.specialRequests || "—"}</p>
                  <p><strong className="text-gray-800">Remarks:</strong> {selectedBooking.remarks || "—"}</p>
                  <div className="pt-2">
                    <span className="text-[10px] text-gray-450 block font-bold">Amount Paid</span>
                    <span className="text-primary font-extrabold text-base">{formatPeso(selectedBooking.amount)}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 h-fit">
                  <h6 className="font-bold text-gray-900 mb-2">Tour Package Info</h6>
                  <p><strong className="text-gray-700">Category:</strong> {selectedTour?.category || "—"}</p>
                  <p><strong className="text-gray-700">Joiner Price:</strong> {selectedTour?.joinerPrice ? formatPeso(selectedTour.joinerPrice) : "—"}</p>
                  <p><strong className="text-gray-700">Max Slots:</strong> {selectedTour?.joinerMaxSlots || "—"}</p>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* ===== APPROVE PRIVATE DIALOG ===== */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-50">
              Approve Private Booking
            </DialogTitle>
          </DialogHeader>

          {approveBooking && (
            <div className="space-y-4 my-2 text-sm">
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Destination:</strong> {approveBooking.tourTitle}</p>
                <p><strong>Customer:</strong> {approveBooking.customer}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Enter Approved Price (₱)</label>
                <input
                  type="number"
                  placeholder="E.g. 3500"
                  value={approvePrice}
                  onChange={(e) => setApprovePrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Remarks (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Provide instructions, meetup points..."
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none resize-none"
                />
              </div>

              <Button
                onClick={approvePrivate}
                disabled={approveLoading}
                className="w-full py-5 text-xs font-bold cursor-pointer"
              >
                {approveLoading ? "Processing..." : "Confirm Approval"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== REJECT PRIVATE DIALOG ===== */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-50 text-red-650">
              Reject Private Booking
            </DialogTitle>
          </DialogHeader>

          {rejectBooking && (
            <div className="space-y-4 my-2 text-sm">
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Destination:</strong> {rejectBooking.tourTitle}</p>
                <p><strong>Customer:</strong> {rejectBooking.customer}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Reason for Rejection *</label>
                <textarea
                  rows="4"
                  placeholder="Provide details (Min 10 characters)..."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none resize-none"
                />
                {rejectError && (
                  <span className="text-red-550 font-semibold text-xs mt-1 block">⚠ {rejectError}</span>
                )}
              </div>

              <Button
                variant="destructive"
                onClick={rejectPrivate}
                disabled={rejectLoading}
                className="w-full py-5 text-xs font-bold cursor-pointer"
              >
                {rejectLoading ? "Processing..." : "Confirm Rejection"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== CANCEL PRIVATE DIALOG ===== */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-50 text-red-650">
              Cancel Private Booking
            </DialogTitle>
          </DialogHeader>

          {cancelBooking && (
            <div className="space-y-4 my-2 text-sm">
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Destination:</strong> {cancelBooking.tourTitle}</p>
                <p><strong>Customer:</strong> {cancelBooking.customer}</p>
                <p><strong>Booking ID:</strong> #{cancelBooking.id}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Reason for Cancellation *</label>
                <textarea
                  rows="4"
                  placeholder="Provide details (Min 10 characters)..."
                  value={cancelRemarks}
                  onChange={(e) => {
                    setCancelRemarks(e.target.value);
                    if (e.target.value.trim().length >= 10) {
                      setCancelError("");
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none resize-none"
                />
                {cancelError && (
                  <span className="text-red-550 font-semibold text-xs mt-1 block">⚠ {cancelError}</span>
                )}
              </div>

              <Button
                variant="destructive"
                onClick={cancelPrivate}
                disabled={cancelLoading}
                className="w-full py-5 text-xs font-bold cursor-pointer"
              >
                {cancelLoading ? "Processing..." : "Confirm Cancellation"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== CLIENTS LIST DIALOG ===== */}
      <Dialog open={clientsModalOpen} onOpenChange={setClientsModalOpen}>
        <DialogContent className="sm:max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-50">
              Clients - {selectedTourClients?.tourTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto max-h-[50vh] mt-2">
            {!selectedTourClients?.bookings || selectedTourClients.bookings.length === 0 ? (
              <p className="text-center text-gray-400 py-10 font-semibold">No bookings yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-3 text-gray-700 font-bold">Client Name</th>
                    <th className="p-3 text-gray-700 font-bold">Email</th>
                    <th className="p-3 text-gray-700 font-bold">Phone</th>
                    <th className="p-3 text-gray-700 font-bold text-center">Pax Slots</th>
                    <th className="p-3 text-gray-700 font-bold">Status</th>
                    <th className="p-3 text-gray-700 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedTourClients.bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-55">
                      <td className="p-3 font-semibold text-gray-800">{b.booker?.fullName}</td>
                      <td className="p-3 text-gray-500">{b.booker?.email}</td>
                      <td className="p-3 text-gray-500">{b.booker?.phoneNumber}</td>
                      <td className="p-3 text-center font-bold text-gray-700">{b.bookingIndividuals}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedClient(b);
                            setClientDetailModal(true);
                          }}
                          className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none cursor-pointer"
                        >
                          <FaEye size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== CLIENT DETAIL VIEW DIALOG ===== */}
      <Dialog open={clientDetailModal} onOpenChange={setClientDetailModal}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-50">
              Client Booking Details
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-2.5 text-xs text-gray-650 my-2 leading-relaxed">
              <p><strong className="text-gray-800">Name:</strong> {selectedClient.booker?.fullName}</p>
              <p><strong className="text-gray-800">Email:</strong> {selectedClient.booker?.email}</p>
              <p><strong className="text-gray-800">Phone:</strong> {selectedClient.booker?.phoneNumber}</p>
              <p><strong className="text-gray-800">Pax Slots:</strong> {selectedClient.bookingIndividuals}</p>
              <p>
                <strong className="text-gray-800">Date selected:</strong>{" "}
                {selectedClient.bookingDateSelected
                  ?.map((d) => new Date(d).toLocaleDateString())
                  .join(", ")}
              </p>
              <p><strong className="text-gray-800">Payment:</strong> {selectedClient.paymentMethod?.toUpperCase()}</p>
              <p><strong className="text-gray-800">Special Request:</strong> {selectedClient.specialRequests || "—"}</p>
              <p><strong className="text-gray-800">Remarks:</strong> {selectedClient.remarks || "—"}</p>
              <p className="flex items-center gap-1.5">
                <strong className="text-gray-800">Status:</strong>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusColor(selectedClient.status)}`}>
                  {selectedClient.status}
                </span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
