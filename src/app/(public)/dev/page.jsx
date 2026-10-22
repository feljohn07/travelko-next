"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  FaTools,
  FaSyncAlt,
  FaSearch,
  FaUsers,
  FaUserLock,
  FaChevronDown,
  FaChevronUp,
  FaTerminal,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBolt,
  FaTrashAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const IS_DEV_UI_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_UI !== "false";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/"
).replace(/\/+$/, "");

// Valid Tour statuses from DevUpdateTourStatusDto in api/api.json
const TOUR_STATUS_OPTIONS = [
  {
    value: "upcoming",
    label: "Upcoming",
    bookingEffect: "Bookings → upcoming",
    btnClass:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white hover:border-sky-600",
    activeClass: "bg-sky-600 text-white border-sky-600 ring-2 ring-sky-200",
  },
  {
    value: "ongoing",
    label: "Ongoing",
    bookingEffect: "Bookings → ongoing",
    btnClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
    activeClass:
      "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200",
  },
  {
    value: "completed",
    label: "Completed",
    bookingEffect: "Bookings → completed",
    btnClass:
      "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
    activeClass:
      "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    bookingEffect: "Bookings → refund-pending",
    btnClass:
      "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600",
    activeClass: "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-200",
  },
];

// Valid Booking statuses from DevUpdateBookingStatusDto in api/api.json
const BOOKING_STATUS_OPTIONS = [
  {
    value: "request",
    label: "Request",
    btnClass:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white",
    activeClass: "bg-amber-500 text-white border-amber-500 ring-2 ring-amber-200",
  },
  {
    value: "approved",
    label: "Approved",
    btnClass:
      "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white",
    activeClass: "bg-teal-600 text-white border-teal-600 ring-2 ring-teal-200",
  },
  {
    value: "upcoming",
    label: "Upcoming",
    btnClass:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white",
    activeClass: "bg-sky-600 text-white border-sky-600 ring-2 ring-sky-200",
  },
  {
    value: "ongoing",
    label: "Ongoing",
    btnClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white",
    activeClass:
      "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200",
  },
  {
    value: "completed",
    label: "Completed",
    btnClass:
      "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white",
    activeClass:
      "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200",
  },
  {
    value: "paid",
    label: "Paid",
    btnClass:
      "border-green-200 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white",
    activeClass: "bg-green-600 text-white border-green-600 ring-2 ring-green-200",
  },
  {
    value: "rejected",
    label: "Rejected",
    btnClass:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white",
    activeClass: "bg-red-600 text-white border-red-600 ring-2 ring-red-200",
  },
  {
    value: "refund-pending",
    label: "Refund Pending",
    btnClass:
      "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white",
    activeClass:
      "bg-orange-600 text-white border-orange-600 ring-2 ring-orange-200",
  },
  {
    value: "refunded",
    label: "Refunded",
    btnClass:
      "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white",
    activeClass:
      "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-200",
  },
];

const getStatusBadgeStyle = (status) => {
  switch ((status || "").toLowerCase().trim()) {
    case "upcoming":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "ongoing":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "completed":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "approved":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "request":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "refund-pending":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "refunded":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
    case "canceled":
    case "rejected":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const formatPeso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const formatShortDate = (dateValue) => {
  if (!dateValue) return "—";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDatesArray = (dates) => {
  if (!dates) return "—";
  let arr = dates;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      arr = [arr];
    }
  }
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  if (arr.length === 1) return formatShortDate(arr[0]);
  return `${formatShortDate(arr[0])} – ${formatShortDate(arr[arr.length - 1])}`;
};

export default function PublicDevStatusManipulatorPage() {
  // Active tab: "joiner" (Tour + all joiner bookings) | "private" (Single private booking)
  const [activeTab, setActiveTab] = useState("joiner");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);

  // Data stores
  const [toursList, setToursList] = useState([]);
  const [privateBookings, setPrivateBookings] = useState([]);
  const [expandedTours, setExpandedTours] = useState({});

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [joinerTourScope, setJoinerTourScope] = useState("with-joiners"); // "with-joiners" | "all"

  // Manual ID quick-override state
  const [manualTourId, setManualTourId] = useState("");
  const [manualBookingId, setManualBookingId] = useState("");

  // Live API Request/Response log for meeting verification
  const [apiLogs, setApiLogs] = useState([]);

  const appendLog = useCallback((entry) => {
    setApiLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        ...entry,
      },
      ...prev.slice(0, 29),
    ]);
  }, []);

  // Standalone HTTP helper (does not trigger global 401 redirect to /login)
  const rawRequest = useCallback(
    async (endpoint, { method = "GET", token = null, body = null } = {}) => {
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (body !== null) {
        headers["Content-Type"] = "application/json";
      }

      const start = performance.now();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body !== null ? JSON.stringify(body) : undefined,
      });
      const durationMs = Math.round(performance.now() - start);
      const rawText = await res.text();
      let data = rawText;
      try {
        data = JSON.parse(rawText);
      } catch {
        // plain text response (e.g. "Booking status updated successfully")
      }

      return {
        ok: res.ok,
        status: res.status,
        durationMs,
        data,
        rawText,
      };
    },
    []
  );

  // Acquire token silently so public visitors in the meeting can view all joiner & private lists
  const resolveAccessToken = useCallback(async () => {
    if (typeof window !== "undefined") {
      const existing =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (existing) {
        const check = await rawRequest("/booking/private/find-all", {
          token: existing,
        });
        if (check.ok) return existing;
      }
    }

    try {
      const loginRes = await rawRequest("/auth/admin/login", {
        method: "POST",
        body: {
          username: process.env.NEXT_PUBLIC_DEV_ADMIN_USER || "admin",
          password: process.env.NEXT_PUBLIC_DEV_ADMIN_PASS || "Password@123",
        },
      });
      if (loginRes.ok && loginRes.data?.accessToken) {
        return loginRes.data.accessToken;
      }
    } catch (err) {
      console.warn("Silent admin auth fallback failed:", err);
    }
    return null;
  }, [rawRequest]);

  // Fetch all tours, joiner groups, and private bookings
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await resolveAccessToken();

      const [publicToursRes, joinerToursRes, privateBookingsRes] =
        await Promise.all([
          rawRequest("/tours"),
          token
            ? rawRequest("/booking/joiner/find-all", { token })
            : Promise.resolve({ ok: false, data: [] }),
          token
            ? rawRequest("/booking/private/find-all", { token })
            : Promise.resolve({ ok: false, data: [] }),
        ]);

      const allTours = Array.isArray(publicToursRes.data)
        ? publicToursRes.data
        : [];
      const joinerTours = Array.isArray(joinerToursRes.data)
        ? joinerToursRes.data
        : [];
      const privates = Array.isArray(privateBookingsRes.data)
        ? privateBookingsRes.data
        : [];

      // Map joiner tours by tour.id so we attach their nested bookings to allTours
      const joinerMap = new Map();
      joinerTours.forEach((jt) => {
        joinerMap.set(Number(jt.id), jt);
      });

      const mergedToursMap = new Map();

      // Start with joinerTours (already has bookings array)
      joinerTours.forEach((jt) => {
        mergedToursMap.set(Number(jt.id), {
          ...jt,
          bookings: Array.isArray(jt.bookings) ? jt.bookings : [],
        });
      });

      // Merge remaining public tours
      allTours.forEach((t) => {
        const id = Number(t.id);
        if (mergedToursMap.has(id)) {
          const existing = mergedToursMap.get(id);
          mergedToursMap.set(id, {
            ...t,
            ...existing,
            bookings: Array.isArray(existing.bookings) ? existing.bookings : [],
          });
        } else {
          mergedToursMap.set(id, {
            ...t,
            bookings: Array.isArray(t.bookings) ? t.bookings : [],
          });
        }
      });

      const mergedTours = Array.from(mergedToursMap.values()).sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      setToursList(mergedTours);

      // Auto-expand tours that have joiner bookings on initial load
      setExpandedTours((prev) => {
        const next = { ...prev };
        mergedTours.forEach((t) => {
          if (t.bookings?.length > 0 && next[t.id] === undefined) {
            next[t.id] = true;
          }
        });
        return next;
      });

      // If no tours have joiners yet, default scope to "all" so list isn't empty
      const hasAnyJoinerTours = mergedTours.some(
        (t) => (t.bookings?.length || 0) > 0
      );
      if (!hasAnyJoinerTours) {
        setJoinerTourScope("all");
      }

      const sortedPrivates = [...privates].sort(
        (a, b) => Number(b.id) - Number(a.id)
      );
      setPrivateBookings(sortedPrivates);
    } catch (err) {
      console.error("Failed to load dev manipulator data:", err);
      toast.error("Failed to fetch tours and bookings data.");
    } finally {
      setLoading(false);
    }
  }, [rawRequest, resolveAccessToken]);

  useEffect(() => {
    if (IS_DEV_UI_ENABLED) {
      const timer = setTimeout(() => {
        fetchAllData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [fetchAllData]);

  // ============================================================================
  // ACTION 1: Update Tour & All Joiner Bookings (PATCH /dev/tours/{tourId}/status)
  // ============================================================================
  const handleUpdateTourAndJoiners = async (tourId, newTourStatus) => {
    const cleanId = Number(tourId);
    if (!cleanId || isNaN(cleanId)) {
      toast.warning("Please provide a valid numeric Tour ID.");
      return;
    }

    const actionKey = `tour-${cleanId}-${newTourStatus}`;
    setBusyKey(actionKey);

    const endpoint = `/dev/tours/${cleanId}/status`;
    const payload = { status: newTourStatus };
    const toastId = toast.loading(
      `Updating Tour #${cleanId} & its joiner bookings to "${newTourStatus}"...`
    );

    try {
      const res = await rawRequest(endpoint, {
        method: "PATCH",
        body: payload,
      });

      appendLog({
        mode: "JOINER (Tour + Bookings)",
        method: "PATCH",
        endpoint,
        payload,
        status: res.status,
        ok: res.ok,
        durationMs: res.durationMs,
        response: res.data,
      });

      if (!res.ok) {
        const msg =
          res.data?.message ||
          res.rawText ||
          `HTTP ${res.status} Failed to update tour status`;
        toast.update(toastId, {
          render: Array.isArray(msg) ? msg.join(", ") : String(msg),
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
        return;
      }

      // Per api/api.json: tour `cancelled` maps bookings to `refund-pending`;
      // other statuses (`upcoming`, `ongoing`, `completed`) copy to bookings.
      const mappedBookingStatus =
        res.data?.bookingStatus ||
        (newTourStatus === "cancelled" ? "refund-pending" : newTourStatus);
      const confirmedTourStatus = res.data?.tourStatus || newTourStatus;

      setToursList((prev) =>
        prev.map((t) => {
          if (Number(t.id) !== cleanId) return t;
          return {
            ...t,
            status: confirmedTourStatus,
            bookings: (t.bookings || []).map((b) => ({
              ...b,
              status: mappedBookingStatus,
            })),
          };
        })
      );

      // Also sync any private bookings referencing this tour if backend updated all related bookings
      setPrivateBookings((prev) =>
        prev.map((pb) => {
          if (Number(pb.tour?.id) !== cleanId) return pb;
          return {
            ...pb,
            status: mappedBookingStatus,
            tour: pb.tour ? { ...pb.tour, status: confirmedTourStatus } : pb.tour,
          };
        })
      );

      const updatedCount =
        res.data?.updatedBookings !== undefined
          ? ` (${res.data.updatedBookings} booking(s) → ${mappedBookingStatus})`
          : ` (bookings → ${mappedBookingStatus})`;

      toast.update(toastId, {
        render: `Tour #${cleanId} set to ${confirmedTourStatus.toUpperCase()}${updatedCount}`,
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: err.message || "Network error updating tour status",
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    } finally {
      setBusyKey(null);
    }
  };

  // ============================================================================
  // ACTION 2: Update Single / Private Booking (PATCH /dev/bookings/{bookingId}/status)
  // ============================================================================
  const handleUpdateBookingStatus = async (
    bookingId,
    newBookingStatus,
    contextLabel = "Private Booking"
  ) => {
    const cleanId = Number(bookingId);
    if (!cleanId || isNaN(cleanId)) {
      toast.warning("Please provide a valid numeric Booking ID.");
      return;
    }

    const actionKey = `booking-${cleanId}-${newBookingStatus}`;
    setBusyKey(actionKey);

    let endpoint = `/dev/bookings/${cleanId}/status`;
    const payload = { status: newBookingStatus };
    const toastId = toast.loading(
      `Updating ${contextLabel} #${cleanId} to "${newBookingStatus}"...`
    );

    try {
      let res = await rawRequest(endpoint, {
        method: "PATCH",
        body: payload,
      });

      // Fallback to /booking/dev/update-status/{bookingId} if 404 on alternate backend build
      if (res.status === 404) {
        const fallbackEndpoint = `/booking/dev/update-status/${cleanId}`;
        const fallbackRes = await rawRequest(fallbackEndpoint, {
          method: "PATCH",
          body: payload,
        });
        if (fallbackRes.ok || fallbackRes.status !== 404) {
          endpoint = fallbackEndpoint;
          res = fallbackRes;
        }
      }

      appendLog({
        mode: contextLabel.toUpperCase(),
        method: "PATCH",
        endpoint,
        payload,
        status: res.status,
        ok: res.ok,
        durationMs: res.durationMs,
        response: res.data,
      });

      if (!res.ok) {
        const msg =
          res.data?.message ||
          res.rawText ||
          `HTTP ${res.status} Failed to update booking status`;
        toast.update(toastId, {
          render: Array.isArray(msg) ? msg.join(", ") : String(msg),
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
        return;
      }

      // Update in Private Bookings list
      setPrivateBookings((prev) =>
        prev.map((pb) =>
          Number(pb.id) === cleanId ? { ...pb, status: newBookingStatus } : pb
        )
      );

      // Update in Joiner Tour nested bookings list if applicable
      setToursList((prev) =>
        prev.map((tour) => ({
          ...tour,
          bookings: (tour.bookings || []).map((jb) =>
            Number(jb.id) === cleanId ? { ...jb, status: newBookingStatus } : jb
          ),
        }))
      );

      toast.update(toastId, {
        render: `${contextLabel} #${cleanId} updated to ${newBookingStatus.toUpperCase()}`,
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: err.message || "Network error updating booking status",
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    } finally {
      setBusyKey(null);
    }
  };

  const toggleExpandTour = (tourId) => {
    setExpandedTours((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
  };

  // Filtered Joiner Tours
  const filteredTours = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return toursList.filter((t) => {
      const hasJoiners = (t.bookings?.length || 0) > 0;
      if (joinerTourScope === "with-joiners" && !hasJoiners) {
        return false;
      }

      if (statusFilter !== "all") {
        const currentStatus = (t.status || "upcoming").toLowerCase();
        if (currentStatus !== statusFilter.toLowerCase()) return false;
      }

      if (!q) return true;

      const matchTour =
        String(t.id).includes(q) ||
        (t.title || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.address || "").toLowerCase().includes(q);

      const matchBooker = (t.bookings || []).some(
        (b) =>
          String(b.id).includes(q) ||
          (b.booker?.fullName || "").toLowerCase().includes(q) ||
          (b.booker?.email || "").toLowerCase().includes(q)
      );

      return matchTour || matchBooker;
    });
  }, [toursList, joinerTourScope, statusFilter, searchQuery]);

  // Filtered Private Bookings
  const filteredPrivateBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return privateBookings.filter((b) => {
      if (statusFilter !== "all") {
        if ((b.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      if (!q) return true;

      return (
        String(b.id).includes(q) ||
        (b.bookingReference || "").toLowerCase().includes(q) ||
        (b.booker?.fullName || "").toLowerCase().includes(q) ||
        (b.booker?.email || "").toLowerCase().includes(q) ||
        (b.booker?.phoneNumber || "").toLowerCase().includes(q) ||
        (b.tour?.title || "").toLowerCase().includes(q)
      );
    });
  }, [privateBookings, statusFilter, searchQuery]);

  // Summary metrics
  const totalToursWithJoiners = useMemo(
    () => toursList.filter((t) => (t.bookings?.length || 0) > 0).length,
    [toursList]
  );
  const totalJoinerBookingsCount = useMemo(
    () =>
      toursList.reduce(
        (sum, t) => sum + (Array.isArray(t.bookings) ? t.bookings.length : 0),
        0
      ),
    [toursList]
  );

  if (!IS_DEV_UI_ENABLED) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gray-50">
        <Card className="max-w-lg w-full rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FaExclamationTriangle size={26} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">
              Development Status UI Disabled
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              This public status manipulation tool is currently disabled via{" "}
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-800">
                NEXT_PUBLIC_ENABLE_DEV_UI=false
              </code>
              .
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Return to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== TOP BANNER & HEADER ===== */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-md border border-slate-700/60">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <FaTools size={11} /> Public Dev Sandbox
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                  No Side Effects (No Email / Payment / Cron Triggers)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Tour & Booking Status Manipulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                Directly manipulate{" "}
                <strong className="text-white">Joiner Tour + All Joiner Bookers</strong>{" "}
                (<code className="text-amber-300">PATCH /dev/tours/&#123;tourId&#125;/status</code>) or{" "}
                <strong className="text-white">Private Booker Status</strong>{" "}
                (<code className="text-amber-300">PATCH /dev/bookings/&#123;bookingId&#125;/status</code>) for live meeting demonstrations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={fetchAllData}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} size={12} />
                {loading ? "Refreshing..." : "Refresh Live Data"}
              </Button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-700/70">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Tours
              </span>
              <span className="text-xl font-black text-white">
                {toursList.length}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tours w/ Joiners
              </span>
              <span className="text-xl font-black text-emerald-400">
                {totalToursWithJoiners}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Joiner Bookings
              </span>
              <span className="text-xl font-black text-sky-400">
                {totalJoinerBookingsCount}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Private Bookings
              </span>
              <span className="text-xl font-black text-amber-400">
                {privateBookings.length}
              </span>
            </div>
          </div>
        </div>

        {/* ===== DIRECT ID QUICK OVERRIDE BAR ===== */}
        <Card className="rounded-2xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaBolt className="text-amber-500" size={14} />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                Quick Manual ID Override (Direct API Trigger)
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Direct Tour + Joiners Override */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">
                      Joiner Mode: Tour + All Its Bookings
                    </span>
                    <code className="text-[11px] text-slate-500 font-mono">
                      PATCH /dev/tours/&#123;tourId&#125;/status
                    </code>
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Tour ID (e.g. 100)"
                    value={manualTourId}
                    onChange={(e) => setManualTourId(e.target.value)}
                    className="w-full sm:w-44 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TOUR_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      disabled={!manualTourId || busyKey !== null}
                      onClick={() =>
                        handleUpdateTourAndJoiners(manualTourId, opt.value)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${opt.btnClass}`}
                      title={opt.bookingEffect}
                    >
                      Set {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Booking ID Override */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">
                      Private / Single Booking Mode: Only Target Booker
                    </span>
                    <code className="text-[11px] text-slate-500 font-mono">
                      PATCH /dev/bookings/&#123;bookingId&#125;/status
                    </code>
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Booking ID (e.g. 189)"
                    value={manualBookingId}
                    onChange={(e) => setManualBookingId(e.target.value)}
                    className="w-full sm:w-48 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BOOKING_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      disabled={!manualBookingId || busyKey !== null}
                      onClick={() =>
                        handleUpdateBookingStatus(
                          manualBookingId,
                          opt.value,
                          "Manual Booking"
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${opt.btnClass}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== MODE TABS & FILTER CONTROLS ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Mode Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-gray-200 shadow-xs w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab("joiner");
                setStatusFilter("all");
              }}
              className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "joiner"
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <FaUsers size={15} />
              <span>Joiner Tours & Bookers</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "joiner"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {joinerTourScope === "with-joiners"
                  ? totalToursWithJoiners
                  : toursList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("private");
                setStatusFilter("all");
              }}
              className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "private"
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <FaUserLock size={14} />
              <span>Private Bookings</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "private"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {privateBookings.length}
              </span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === "joiner" && (
              <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 text-xs font-bold">
                <button
                  onClick={() => setJoinerTourScope("with-joiners")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    joinerTourScope === "with-joiners"
                      ? "bg-slate-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  With Joiners ({totalToursWithJoiners})
                </button>
                <button
                  onClick={() => setJoinerTourScope("all")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    joinerTourScope === "all"
                      ? "bg-slate-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All Tours ({toursList.length})
                </button>
              </div>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {(activeTab === "joiner"
                ? TOUR_STATUS_OPTIONS
                : BOOKING_STATUS_OPTIONS
              ).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-64">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={12}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "joiner"
                    ? "Search tour, ID, or joiner name..."
                    : "Search private booker, ID, or tour..."
                }
                className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* ===== TAB 1: JOINER TOURS & BOOKERS ===== */}
        {activeTab === "joiner" && (
          <div className="space-y-4">
            {/* Explanation Callout */}
            <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-sky-950">
              <div>
                <span className="font-extrabold uppercase tracking-wider text-sky-700 mr-2">
                  Joiner Rule:
                </span>
                Clicking a Tour Status button calls{" "}
                <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-sky-200">
                  PATCH /dev/tours/&#123;tourId&#125;/status
                </code>{" "}
                — updating the <strong>Tour status</strong> AND{" "}
                <strong>all joiner bookers</strong> in one transaction (setting{" "}
                <code className="font-mono font-bold">cancelled</code> maps all
                bookings to{" "}
                <code className="font-mono font-bold">refund-pending</code>).
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-gray-100">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-xs font-bold text-gray-500">
                  Loading tours and joiner bookers...
                </p>
              </div>
            ) : filteredTours.length === 0 ? (
              <Card className="rounded-2xl border-gray-200 bg-white">
                <CardContent className="p-12 text-center space-y-3">
                  <p className="text-sm font-bold text-gray-600">
                    No tours matched your current filter.
                  </p>
                  {joinerTourScope === "with-joiners" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setJoinerTourScope("all")}
                      className="text-xs font-bold"
                    >
                      Show All {toursList.length} Tours Instead
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTours.map((tour) => {
                const currentStatus = (tour.status || "upcoming").toLowerCase();
                const joiners = Array.isArray(tour.bookings)
                  ? tour.bookings
                  : [];
                const isExpanded = !!expandedTours[tour.id];

                return (
                  <Card
                    key={tour.id}
                    className="rounded-2xl border-gray-200 shadow-xs bg-white overflow-hidden"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Tour Top Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-xs font-black">
                              Tour #{tour.id}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${getStatusBadgeStyle(
                                currentStatus
                              )}`}
                            >
                              Tour Status: {currentStatus}
                            </span>
                            {tour.category && (
                              <Badge
                                variant="outline"
                                className="text-[11px] font-bold text-gray-600"
                              >
                                {tour.category}
                              </Badge>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              {joiners.length} Joiner Booking
                              {joiners.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                            {tour.title || "Untitled Tour"}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                            {tour.address && (
                              <span className="inline-flex items-center gap-1">
                                <FaMapMarkerAlt className="text-gray-400" />
                                {tour.address}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" />
                              {formatDatesArray(tour.availableDates)}
                            </span>
                            <span>
                              Rate:{" "}
                              <strong className="text-gray-800">
                                {formatPeso(tour.joinerPrice)}
                              </strong>
                            </span>
                            <span>
                              Slots:{" "}
                              <strong className="text-gray-800">
                                {tour.joinerBookedSlots ?? 0} /{" "}
                                {tour.joinerMaxSlots ?? 0}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Tour + All Joiner Bookers Status Buttons */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 shrink-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                              Update Tour & All {joiners.length} Joiner Booker(s)
                            </span>
                            <code className="text-[10px] font-mono text-slate-400">
                              /dev/tours/{tour.id}/status
                            </code>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {TOUR_STATUS_OPTIONS.map((opt) => {
                              const isCurrent = currentStatus === opt.value;
                              const isBusy =
                                busyKey === `tour-${tour.id}-${opt.value}`;
                              return (
                                <button
                                  key={opt.value}
                                  disabled={busyKey !== null}
                                  onClick={() =>
                                    handleUpdateTourAndJoiners(
                                      tour.id,
                                      opt.value
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex flex-col items-start ${
                                    isCurrent ? opt.activeClass : opt.btnClass
                                  } disabled:opacity-50`}
                                >
                                  <span>
                                    {isBusy
                                      ? "Updating..."
                                      : isCurrent
                                      ? `✓ ${opt.label}`
                                      : opt.label}
                                  </span>
                                  <span
                                    className={`text-[9px] font-normal ${
                                      isCurrent
                                        ? "text-white/90"
                                        : "opacity-75"
                                    }`}
                                  >
                                    {opt.bookingEffect}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse Joiner Bookers Roster */}
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={() => toggleExpandTour(tour.id)}
                          className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-700 hover:text-primary transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <FaChevronUp size={11} />
                          ) : (
                            <FaChevronDown size={11} />
                          )}
                          <span>
                            {isExpanded ? "Hide" : "Show"} Joiner Bookers Roster (
                            {joiners.length})
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3">
                            {joiners.length === 0 ? (
                              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500">
                                No joiner bookings recorded for this tour yet.
                                Clicking the tour status buttons above will
                                still update the tour&apos;s status.
                              </div>
                            ) : (
                              <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[10px]">
                                    <tr>
                                      <th className="p-3 font-extrabold">
                                        Booking ID
                                      </th>
                                      <th className="p-3 font-extrabold">
                                        Joiner Booker
                                      </th>
                                      <th className="p-3 font-extrabold text-center">
                                        Pax
                                      </th>
                                      <th className="p-3 font-extrabold text-right">
                                        Amount
                                      </th>
                                      <th className="p-3 font-extrabold">
                                        Current Status
                                      </th>
                                      <th className="p-3 font-extrabold">
                                        Individual Override (Optional)
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 bg-white">
                                    {joiners.map((jb) => {
                                      const jbStatus = (
                                        jb.status || "upcoming"
                                      ).toLowerCase();
                                      return (
                                        <tr
                                          key={jb.id}
                                          className="hover:bg-gray-50/80"
                                        >
                                          <td className="p-3 font-extrabold text-gray-800 whitespace-nowrap">
                                            #{jb.id}
                                          </td>
                                          <td className="p-3">
                                            <div className="font-bold text-gray-900">
                                              {jb.booker?.fullName || "—"}
                                            </div>
                                            <div className="text-[11px] text-gray-500">
                                              {jb.booker?.email || "—"} •{" "}
                                              {jb.booker?.phoneNumber || "—"}
                                            </div>
                                          </td>
                                          <td className="p-3 text-center font-bold text-gray-700">
                                            {jb.bookingIndividuals || 1}
                                          </td>
                                          <td className="p-3 text-right font-bold text-gray-900 whitespace-nowrap">
                                            {formatPeso(jb.amount)}
                                          </td>
                                          <td className="p-3 whitespace-nowrap">
                                            <span
                                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadgeStyle(
                                                jbStatus
                                              )}`}
                                            >
                                              {jbStatus}
                                            </span>
                                          </td>
                                          <td className="p-3">
                                            <div className="flex flex-wrap gap-1">
                                              {BOOKING_STATUS_OPTIONS.map(
                                                (bOpt) => {
                                                  const isCurrentB =
                                                    jbStatus === bOpt.value;
                                                  return (
                                                    <button
                                                      key={bOpt.value}
                                                      disabled={busyKey !== null}
                                                      onClick={() =>
                                                        handleUpdateBookingStatus(
                                                          jb.id,
                                                          bOpt.value,
                                                          "Joiner Booker"
                                                        )
                                                      }
                                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                                        isCurrentB
                                                          ? bOpt.activeClass
                                                          : bOpt.btnClass
                                                      } disabled:opacity-50`}
                                                    >
                                                      {bOpt.label}
                                                    </button>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ===== TAB 2: PRIVATE BOOKINGS ===== */}
        {activeTab === "private" && (
          <div className="space-y-4">
            {/* Explanation Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
              <div>
                <span className="font-extrabold uppercase tracking-wider text-amber-800 mr-2">
                  Private Rule:
                </span>
                Clicking a status button below calls{" "}
                <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">
                  PATCH /dev/bookings/&#123;bookingId&#125;/status
                </code>{" "}
                — updating <strong>only that private booker&apos;s status</strong>{" "}
                without modifying the parent tour or other bookers.
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-gray-100">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-xs font-bold text-gray-500">
                  Loading private bookings...
                </p>
              </div>
            ) : filteredPrivateBookings.length === 0 ? (
              <Card className="rounded-2xl border-gray-200 bg-white">
                <CardContent className="p-12 text-center">
                  <p className="text-sm font-bold text-gray-500">
                    No private bookings found matching your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPrivateBookings.map((pb) => {
                const currentStatus = (pb.status || "request").toLowerCase();
                const datesDisplay = formatDatesArray(
                  pb.tourDateSelected || pb.bookingDateSelected
                );

                return (
                  <Card
                    key={pb.id}
                    className="rounded-2xl border-gray-200 shadow-xs bg-white overflow-hidden"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Left: Private Booking & Booker Info */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-xs font-black">
                              Booking #{pb.id}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${getStatusBadgeStyle(
                                currentStatus
                              )}`}
                            >
                              Status: {currentStatus}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              Private Booking
                            </span>
                            {pb.bookingReference && (
                              <code className="text-[11px] text-gray-400 font-mono">
                                Ref: {pb.bookingReference}
                              </code>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                                Private Booker
                              </span>
                              <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                                {pb.booker?.fullName || "—"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {pb.booker?.email || "—"} •{" "}
                                {pb.booker?.phoneNumber || "—"}
                              </p>
                              {pb.booker?.refundMethod && (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Refund: {pb.booker.refundMethod.toUpperCase()}{" "}
                                  ({pb.booker.accountNumber || "—"})
                                </p>
                              )}
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                                Tour & Booking Details
                              </span>
                              <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                                {pb.tour?.title || "—"}
                                {pb.tour?.id ? ` (Tour #${pb.tour.id})` : ""}
                              </p>
                              <p className="text-xs text-gray-600">
                                Pax:{" "}
                                <strong>{pb.bookingIndividuals || 1}</strong> •
                                Amount:{" "}
                                <strong>{formatPeso(pb.amount)}</strong> •
                                Method:{" "}
                                <strong className="uppercase">
                                  {pb.paymentMethod || "—"}
                                </strong>
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Requested Date(s): {datesDisplay}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right: 9 Private Booking Status Action Buttons */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 lg:w-[440px] shrink-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                              Update Only This Private Booker
                            </span>
                            <code className="text-[10px] font-mono text-slate-400">
                              /dev/bookings/{pb.id}/status
                            </code>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {BOOKING_STATUS_OPTIONS.map((opt) => {
                              const isCurrent = currentStatus === opt.value;
                              const isBusy =
                                busyKey === `booking-${pb.id}-${opt.value}`;
                              return (
                                <button
                                  key={opt.value}
                                  disabled={busyKey !== null}
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      pb.id,
                                      opt.value,
                                      "Private Booking"
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                    isCurrent ? opt.activeClass : opt.btnClass
                                  } disabled:opacity-50`}
                                >
                                  {isBusy
                                    ? "Updating..."
                                    : isCurrent
                                    ? `✓ ${opt.label}`
                                    : opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ===== LIVE API PAYLOAD & RESPONSE INSPECTOR ===== */}
        <Card className="rounded-2xl border-slate-800 bg-slate-900 text-slate-100 shadow-md overflow-hidden">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FaTerminal className="text-emerald-400" size={14} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Live API Payload & Response Verification Log ({apiLogs.length})
                </h3>
              </div>
              {apiLogs.length > 0 && (
                <button
                  onClick={() => setApiLogs([])}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <FaTrashAlt size={10} /> Clear Log
                </button>
              )}
            </div>

            {apiLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center font-mono">
                Click any status button above to inspect the exact PATCH request
                payload and backend response here during your meeting.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 font-mono text-xs">
                {apiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.ok
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {log.ok ? (
                            <FaCheckCircle size={10} />
                          ) : (
                            <FaExclamationTriangle size={10} />
                          )}
                          HTTP {log.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          {log.method}
                        </span>
                        <span className="text-slate-200 font-bold">
                          {log.endpoint}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          [{log.mode}]
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {log.timestamp} • {log.durationMs}ms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px] mb-0.5">
                          Request Payload:
                        </span>
                        <pre className="text-amber-300 whitespace-pre-wrap break-all">
                          {JSON.stringify(log.payload)}
                        </pre>
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px] mb-0.5">
                          Response Body:
                        </span>
                        <pre className="text-emerald-300 whitespace-pre-wrap break-all">
                          {typeof log.response === "string"
                            ? log.response
                            : JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
