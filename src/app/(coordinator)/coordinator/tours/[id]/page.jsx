"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  getTourTimeStatus,
  getTourStatusBadgeClass,
  parseAvailableDates,
  formatTourDate,
} from "@/lib/tourStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaSuitcaseRolling,
  FaClock,
  FaImage,
  FaPlus,
  FaTimes,
  FaCompass,
} from "react-icons/fa";

const CATEGORIES = [
  "Mountain Climbing",
  "Island Hopping",
  "Scuba Diving",
  "Camping",
  "Hiking",
  "Nature & Cultural",
  "Adventure & Extreme",
  "Beach & Relaxation",
];

const normalizeToArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(/,|\n/)
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const getImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
};

export default function CoordinatorTourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const tourId = params?.id;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active picture preview index
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [form, setForm] = useState({
    title: "",
    category: "Mountain Climbing",
    address: "",
    meetupLocations: "",
    details: "",
    packageInclusions: "",
    itinerary: [],
    thingsToBring: "",
    joinerPrice: "",
    joinerMaxSlots: "",
    pictures: [],
    latitude: "",
    longitude: "",
  });

  // Location suggestions state
  const suggestionsRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ignoreNextSearch = useRef(false);

  const picturesInputRef = useRef(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Fetch tour details
  const fetchTour = async () => {
    if (!tourId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tours/${tourId}`);
      if (res.data) {
        setTour(res.data);
      } else {
        setError("Tour package not found.");
      }
    } catch (err) {
      console.error("Failed to load tour details", err);
      setError(err.response?.data?.message || "Failed to load tour package details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tourId) return;
    let isMounted = true;

    api
      .get(`/tours/${tourId}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          setTour(res.data);
          setError(null);
        } else {
          setError("Tour package not found.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load tour details", err);
        setError(
          err.response?.data?.message || "Failed to load tour package details."
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tourId]);

  // Open Edit Dialog
  const openEditModal = () => {
    if (!tour) return;
    ignoreNextSearch.current = true;

    setForm({
      title: tour.title || "",
      category: tour.category || "Mountain Climbing",
      address: tour.address || "",
      meetupLocations: normalizeToArray(tour.meetupLocations).join(", "),
      details: tour.details || "",
      packageInclusions: normalizeToArray(tour.packageInclusions).join(", "),
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
      thingsToBring: normalizeToArray(tour.thingsToBring).join("\n"),
      joinerPrice: tour.joinerPrice || "",
      joinerMaxSlots: tour.joinerMaxSlots || "",
      pictures: [],
      latitude: tour.latitude !== undefined && tour.latitude !== null ? String(tour.latitude) : "",
      longitude: tour.longitude !== undefined && tour.longitude !== null ? String(tour.longitude) : "",
    });

    const parsed = parseAvailableDates(tour.availableDates);
    if (parsed.length > 0) {
      setDateRange([parsed[0].start, parsed[0].end]);
    } else {
      setDateRange([null, null]);
    }

    setEditOpen(true);
  };

  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Sync itinerary days with date range
  useEffect(() => {
    if (!editOpen) return;
    const days = getDaysBetween(startDate, endDate);
    const timer = setTimeout(() => {
      if (days <= 0) {
        setForm((prev) => ({ ...prev, itinerary: [] }));
        return;
      }
      setForm((prev) => {
        const list = [...prev.itinerary];
        while (list.length < days) {
          list.push("");
        }
        return { ...prev, itinerary: list.slice(0, days) };
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [startDate, endDate, editOpen]);

  // Location suggestions debounce
  useEffect(() => {
    if (ignoreNextSearch.current) {
      ignoreNextSearch.current = false;
      return;
    }

    if (!form.address || form.address.trim().length < 3) {
      const timer = setTimeout(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const delayDebounce = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const res = await fetch(
          `/api/location/suggestions?place=${encodeURIComponent(form.address)}`
        );
        if (res.ok) {
          const list = await res.json();
          const cleanList = Array.isArray(list) ? list.filter(Boolean) : [];
          setSuggestions(cleanList);
          setShowSuggestions(cleanList.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [form.address]);

  // Handle outside click for address suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    if (!item || !item.properties) return;
    const p = item.properties;
    const parts = [
      p.name,
      p.street,
      p.suburb || p.locality || p.district,
      p.city || p.municipality,
      p.state || p.county,
      p.country,
    ].filter(Boolean);

    const uniqueParts = [];
    parts.forEach((part) => {
      if (!uniqueParts.includes(part)) {
        uniqueParts.push(part);
      }
    });

    ignoreNextSearch.current = true;
    setForm((prev) => ({
      ...prev,
      address: uniqueParts.join(", ") || p.formatted || p.name || "",
      longitude: item.geometry?.coordinates?.[0] !== undefined ? String(item.geometry.coordinates[0]) : "",
      latitude: item.geometry?.coordinates?.[1] !== undefined ? String(item.geometry.coordinates[1]) : "",
    }));
    setShowSuggestions(false);
  };

  const handleFormChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handlePictures = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({
      ...prev,
      pictures: [...prev.pictures, ...files],
    }));
  };

  const removePicture = (idx) => {
    setForm((prev) => {
      const next = [...prev.pictures];
      next.splice(idx, 1);
      return { ...prev, pictures: next };
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warning("Please specify the tour start and end dates.");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("address", form.address);
    fd.append("availableDates", JSON.stringify([startDate, endDate]));
    fd.append(
      "meetupLocations",
      JSON.stringify(
        form.meetupLocations
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
      )
    );
    fd.append("packageInclusions", form.packageInclusions);
    fd.append("itinerary", JSON.stringify(form.itinerary));
    fd.append(
      "thingsToBring",
      JSON.stringify(
        form.thingsToBring
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean)
      )
    );
    fd.append("joinerPrice", form.joinerPrice);
    fd.append("joinerMaxSlots", form.joinerMaxSlots);
    fd.append("latitude", form.latitude);
    fd.append("longitude", form.longitude);
    fd.append("details", form.details);

    form.pictures.forEach((file) => fd.append("pictures", file));

    const toastId = toast.loading("Updating tour package...");

    try {
      await api.put(`/tours/update/${tourId}`, fd);
      toast.update(toastId, {
        render: "✏️ Tour package updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setEditOpen(false);
      fetchTour();
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: `❌ ${err.response?.data?.message || "Failed to update tour package."}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Tour Package
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tours/${tourId}`);
      toast.success("🗑️ Tour package deleted successfully.");
      setDeleteConfirmOpen(false);
      router.replace("/coordinator/tours");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete tour package.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-semibold text-gray-500">Loading tour package details...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tour Package Not Found</h3>
          <p className="text-sm text-gray-500 mb-6">{error || "The requested tour package could not be retrieved."}</p>
          <Link
            href="/coordinator/tours"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-95 transition-opacity"
          >
            <FaArrowLeft size={14} /> Back to Tour Packages
          </Link>
        </div>
      </div>
    );
  }

  const tourStatus = getTourTimeStatus(tour);
  const parsedDates = parseAvailableDates(tour.availableDates);
  const durationText =
    parsedDates.length > 0
      ? `${formatTourDate(parsedDates[0].start)} – ${formatTourDate(parsedDates[0].end)}`
      : "Dates not set";

  const numDays =
    parsedDates.length > 0
      ? getDaysBetween(parsedDates[0].start, parsedDates[0].end)
      : 0;

  const pictureList = normalizeToArray(tour.pictureUrls);
  const inclusionsList = normalizeToArray(tour.packageInclusions);
  const itineraryList = normalizeToArray(tour.itinerary);
  const thingsToBringList = normalizeToArray(tour.thingsToBring);
  const meetupList = normalizeToArray(tour.meetupLocations);

  const canEdit = tourStatus === "upcoming";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <Link
            href="/coordinator/tours"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer mb-1"
          >
            <FaArrowLeft size={12} /> Back to Tour Packages
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {tour.title}
            </h1>
            <span className="px-3 py-1 bg-brand-light text-primary text-xs font-bold rounded-lg">
              {tour.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getTourStatusBadgeClass(
                tourStatus
              )}`}
            >
              {tourStatus}
            </span>
          </div>
          <p className="text-xs text-gray-400">Tour Package #{tour.id || tour._id}</p>
        </div>

        {/* Action Buttons: Edit and Delete */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={openEditModal}
            disabled={!canEdit}
            title={!canEdit ? "Only upcoming packages can be edited" : "Edit tour package"}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer ${
              canEdit
                ? "bg-primary hover:bg-brand-dark text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          >
            <FaEdit size={14} /> Edit Package
          </Button>

          <Button
            onClick={() => setDeleteConfirmOpen(true)}
            variant="outline"
            className="px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-xs cursor-pointer"
          >
            <FaTrash size={14} /> Delete Package
          </Button>
        </div>
      </div>

      {/* Media & Picture Showcase */}
      {pictureList.length > 0 ? (
        <div className="space-y-3">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-900">
            <Image
              src={getImageUrl(pictureList[activePhotoIdx])}
              alt={tour.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold rounded-lg">
              Photo {activePhotoIdx + 1} of {pictureList.length}
            </div>
          </div>

          {pictureList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {pictureList.map((pic, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx ? "border-primary ring-2 ring-primary/20 scale-102" : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={getImageUrl(pic)}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-44 w-full rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col items-center justify-center text-emerald-700/60 space-y-2">
          <FaImage size={36} />
          <span className="text-xs font-semibold">No tour photos uploaded</span>
        </div>
      )}

      {/* Key Metrics / Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rate Card */}
        <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-primary flex items-center justify-center shrink-0">
              <FaMoneyBillWave size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Joiner Rate</p>
              <h3 className="text-lg font-extrabold text-gray-900">₱{Number(tour.joinerPrice || 0).toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 font-medium">per slot</p>
            </div>
          </CardContent>
        </Card>

        {/* Capacity / Slots */}
        <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FaUsers size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Slots Availability</p>
              <h3 className="text-lg font-extrabold text-gray-900">
                {tour.joinerBookedSlots || 0} / {tour.joinerMaxSlots || 0}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                {Math.max(0, (tour.joinerMaxSlots || 0) - (tour.joinerBookedSlots || 0))} slots remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FaCalendarAlt size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
              <h4 className="text-xs font-bold text-gray-800 truncate" title={durationText}>
                {durationText}
              </h4>
              <p className="text-[10px] text-gray-400 font-medium">
                {numDays > 0 ? `${numDays} day${numDays > 1 ? "s" : ""}` : "Flexible schedule"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Meetup Card */}
        <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FaMapMarkerAlt size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destination</p>
              <h4 className="text-xs font-bold text-gray-800 truncate" title={tour.address || "—"}>
                {tour.address || "Address not provided"}
              </h4>
              <p className="text-[10px] text-gray-400 font-medium truncate">
                {meetupList[0] ? `Meetup: ${meetupList[0]}` : "Meetup TBA"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Description, Itinerary, Inclusions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview & Description */}
          <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaCompass className="text-primary" /> Tour Overview
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {tour.details || "No description provided for this tour package."}
              </p>
            </CardContent>
          </Card>

          {/* Day-by-Day Itinerary */}
          <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaClock className="text-primary" /> Daily Itinerary
              </h3>

              {itineraryList.length > 0 ? (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {itineraryList.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-2xs" />
                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                          Day {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-800 whitespace-pre-line">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No daily itinerary entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Package Inclusions */}
          <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> Package Inclusions
              </h3>

              {inclusionsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inclusionsList.map((inc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60 text-xs font-semibold text-gray-800"
                    >
                      <FaCheckCircle className="text-emerald-500 shrink-0" size={13} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No inclusions listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Things to Bring, Meetup, GPS */}
        <div className="space-y-6">
          {/* Things to Bring */}
          <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaSuitcaseRolling className="text-amber-500" /> Things to Bring
              </h3>

              {thingsToBringList.length > 0 ? (
                <ul className="space-y-2">
                  {thingsToBringList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No specific items listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Meetup Locations */}
          <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" /> Meetup Points
              </h3>

              {meetupList.length > 0 ? (
                <div className="space-y-2">
                  {meetupList.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800 flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{m}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No meetup points specified.</p>
              )}
            </CardContent>
          </Card>

          {/* Location & GPS Coordinates */}
          <Card className="rounded-2xl border-gray-100 shadow-xs bg-white">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <FaCompass className="text-purple-600" /> Geographic Info
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Destination</span>
                  <span className="text-gray-800 font-semibold">{tour.address || "—"}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Latitude</span>
                    <span className="text-gray-700 font-mono">{tour.latitude || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Longitude</span>
                    <span className="text-gray-700 font-mono">{tour.longitude || "—"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== EDIT TOUR DIALOG MODAL ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">
              Update Tour Package
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 my-2 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleFormChange("title")}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={handleFormChange("category")}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available Dates */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Available Dates *</label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                minDate={tomorrow}
                placeholderText="Select date range"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Address with suggestions */}
            <div className="relative" ref={suggestionsRef}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Address / Destination *</label>
              <input
                type="text"
                value={form.address}
                onChange={handleFormChange("address")}
                required
                placeholder="Search destination..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {suggestions.map((item, idx) => {
                    const title =
                      item.properties?.name ||
                      item.properties?.formatted ||
                      "Unknown Location";
                    const subtitle =
                      [
                        item.properties?.street,
                        item.properties?.suburb || item.properties?.district,
                        item.properties?.city || item.properties?.municipality,
                        item.properties?.state,
                      ]
                        .filter(Boolean)
                        .filter((p) => p !== title)
                        .join(", ");
                    const tag =
                      item.properties?.result_type ||
                      item.properties?.type ||
                      item.properties?.category;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-3.5 py-2.5 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 flex justify-between items-center gap-2"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 truncate">
                            {title}
                          </span>
                          {subtitle && (
                            <span className="text-[11px] text-gray-500 truncate">
                              {subtitle}
                            </span>
                          )}
                        </div>
                        {tag && (
                          <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            {tag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="px-3.5 py-1.5 text-[10px] text-gray-400 bg-gray-50 flex items-center justify-between border-t border-gray-100 rounded-b-xl">
                    <span>Philippines Search</span>
                    <a
                      href="https://www.geoapify.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-gray-500 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Powered by Geoapify & OSM
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Meetup Locations */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Meetup Locations (comma separated)</label>
              <input
                type="text"
                value={form.meetupLocations}
                onChange={handleFormChange("meetupLocations")}
                placeholder="Terminal 1, Central Mall..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Pricing & Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Joiner Price (₱) *</label>
                <input
                  type="number"
                  value={form.joinerPrice}
                  onChange={handleFormChange("joinerPrice")}
                  required
                  min="0"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Max Joiner Slots *</label>
                <input
                  type="number"
                  value={form.joinerMaxSlots}
                  onChange={handleFormChange("joinerMaxSlots")}
                  required
                  min="1"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Package Inclusions */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Package Inclusions</label>
              <textarea
                value={form.packageInclusions}
                onChange={handleFormChange("packageInclusions")}
                placeholder="Meals, Entrance fees, Boat rental..."
                rows={2}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Things to Bring */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Things to Bring (one per line)</label>
              <textarea
                value={form.thingsToBring}
                onChange={handleFormChange("thingsToBring")}
                placeholder="Swimwear&#10;Sunblock&#10;Dry bag"
                rows={3}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Details Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Details & Overview</label>
              <textarea
                value={form.details}
                onChange={handleFormChange("details")}
                rows={3}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Dynamic Itinerary Days */}
            {form.itinerary.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500">Day-by-Day Itinerary</label>
                {form.itinerary.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-gray-500 w-14 shrink-0">Day {idx + 1}:</span>
                    <input
                      type="text"
                      value={it}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((prev) => {
                          const next = [...prev.itinerary];
                          next[idx] = val;
                          return { ...prev, itinerary: next };
                        });
                      }}
                      placeholder={`Activities for Day ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Upload New Pictures */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Upload New Photos (Optional — replacing current photos)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={picturesInputRef}
                onChange={handlePictures}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />

              {form.pictures.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.pictures.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 w-16 h-16">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePicture(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-brand-dark text-white font-bold">
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900">
              Delete Tour Package?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm text-gray-600">
            <p>
              Are you sure you want to delete <span className="font-bold text-gray-900">{tour.title}</span>?
            </p>
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              ⚠️ Warning: This will permanently delete this tour package and all associated bookings. This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleting ? "Deleting..." : "Yes, Delete Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
