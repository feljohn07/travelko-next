"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FaPlus,
  FaImage,
  FaTrash,
  FaEdit,
  FaCalendarAlt,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

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

export default function CoordinatorTours() {
  const { token } = useAuth();
  const picturesInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [tours, setTours] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tourFilter, setTourFilter] = useState("all");

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [expandedCards, setExpandedCards] = useState({});

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ignoreNextSearch = useRef(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

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

  const [isEdit, setIsEdit] = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);

  const getTourTimeStatus = (tour) => {
    const dates = parseAvailableDates(tour.availableDates);
    if (!dates.length) return "draft";

    const today = new Date();
    const start = new Date(dates[0].start);
    const end = new Date(dates[0].end);

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "upcoming";
    if (today >= start && today <= end) return "ongoing";
    if (today > end) return "completed";

    return "draft";
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (tour) => {
    setIsEdit(true);
    setEditingTourId(tour._id || tour.id);
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

    setOpen(true);
  };

  const parseAvailableDates = (availableDates) => {
    if (!Array.isArray(availableDates) || availableDates.length === 0)
      return [];

    const dates = availableDates
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()));

    if (dates.length === 0) return [];

    return [{ start: dates[0], end: dates[dates.length - 1] }];
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const resetForm = () => {
    setIsEdit(false);
    setEditingTourId(null);
    setDateRange([null, null]);
    setSuggestions([]);
    setSuggestionsLoading(false);
    setShowSuggestions(false);
    ignoreNextSearch.current = false;
    setForm({
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
  };

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

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

  const fetchMyTours = async () => {
    try {
      const res = await api.get("tours/my-tours");
      setTours(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tour packages.");
    }
  };

  const formatAddressDetail = (feature) => {
    if (!feature || !feature.properties) return "";
    const p = feature.properties;
    const parts = [
      p.street,
      p.locality || p.district,
      p.city,
      p.state,
      p.country,
    ].filter(Boolean);

    const uniqueParts = [];
    parts.forEach((part) => {
      if (!uniqueParts.includes(part) && part !== p.name) {
        uniqueParts.push(part);
      }
    });
    return uniqueParts.join(", ");
  };

  const handleSelectSuggestion = (item) => {
    if (!item || !item.properties) return;
    const p = item.properties;
    const parts = [
      p.name,
      p.street,
      p.locality || p.district,
      p.city,
      p.state,
      p.country,
    ].filter(Boolean);

    const uniqueParts = [];
    parts.forEach((part) => {
      if (!uniqueParts.includes(part)) {
        uniqueParts.push(part);
      }
    });
    const formatted = uniqueParts.join(", ");

    ignoreNextSearch.current = true;
    setForm((prev) => ({
      ...prev,
      address: formatted,
      longitude:
        item.geometry?.coordinates?.[0] !== undefined
          ? String(item.geometry.coordinates[0])
          : "",
      latitude:
        item.geometry?.coordinates?.[1] !== undefined
          ? String(item.geometry.coordinates[1])
          : "",
    }));
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        const res = await api.get("location/suggestions", {
          params: { place: form.address },
        });
        const list = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [form.address]);

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchMyTours();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Unauthorized session. Please login.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("address", form.address);
    fd.append("details", form.details);

    let availableDatesPayload = [];
    if (startDate && endDate) {
      const current = new Date(startDate);
      while (current <= endDate) {
        const utcDate = new Date(
          Date.UTC(
            current.getFullYear(),
            current.getMonth(),
            current.getDate()
          )
        );
        availableDatesPayload.push(utcDate.toISOString());
        current.setDate(current.getDate() + 1);
      }
    }
    fd.append("availableDates", JSON.stringify(availableDatesPayload));

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

    form.pictures.forEach((file) => fd.append("pictures", file));

    const toastId = toast.loading(
      isEdit ? "Updating tour package..." : "Publishing tour package..."
    );

    try {
      if (isEdit && editingTourId) {
        await api.put(`tours/update/${editingTourId}`, fd);
        toast.update(toastId, {
          render: "✏️ Tour package updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        await api.post("tours/create", fd);
        toast.update(toastId, {
          render: "🎉 Tour package published successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      }

      setOpen(false);
      resetForm();
      fetchMyTours();
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: `❌ ${err.response?.data?.message || "Operation failed."}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (tourId) => {
    toast(
      ({ closeToast }) => (
        <div className="p-1">
          <p className="font-bold text-sm text-gray-900 mb-2">Delete this tour package?</p>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={closeToast}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                closeToast();
                const snapshot = [...tours];
                setTours((prev) => prev.filter((t) => (t._id || t.id) !== tourId));

                try {
                  await api.delete(`tours/${tourId}`);
                  toast.success("🗑️ Tour package deleted.");
                } catch (error) {
                  setTours(snapshot);
                  toast.error("❌ Delete failed. Restored package.");
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

  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "text-green-600 bg-green-50";
      case "completed":
        return "text-blue-600 bg-blue-50";
      case "upcoming":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  useEffect(() => {
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
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Filters & Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-150">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Tour Packages
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">Manage your listed adventures</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={tourFilter}
            onChange={(e) => setTourFilter(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none"
          >
            <option value="all">All Packages</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold bg-primary hover:bg-brand-dark rounded-xl shrink-0 cursor-pointer shadow-sm"
          >
            <FaPlus className="mr-1" /> New Package
          </Button>
        </div>
      </div>

      {/* Tour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours
          .filter((t) => {
            if (tourFilter === "all") return true;
            return getTourTimeStatus(t) === tourFilter;
          })
          .map((t) => {
            const dates = parseAvailableDates(t.availableDates);
            const tourStatus = getTourTimeStatus(t);

            return (
              <Card key={t._id || t.id} className="rounded-2xl border-gray-100 shadow-sm flex flex-col h-full bg-white overflow-hidden">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base line-clamp-1">{t.title}</h4>
                      <span className="inline-block mt-1.5 px-2.5 py-1 bg-brand-light text-primary text-[10px] font-bold rounded-lg leading-none">
                        {t.category}
                      </span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {/* Bug #5 Fixed: disabled aligns check on tourStatus instead of stale t.status */}
                      <button
                        disabled={tourStatus !== "upcoming"}
                        onClick={() => handleEdit(t)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer focus:outline-none ${
                          tourStatus === "upcoming"
                            ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                        title={tourStatus !== "upcoming" ? "Only upcoming packages can be edited" : "Edit Package"}
                      >
                        <FaEdit size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(t._id || t.id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer focus:outline-none"
                        title="Delete Package"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="font-bold text-gray-400">Duration:</span>
                      <span className="text-gray-700 font-medium">
                        {dates.length > 0
                          ? dates.map((d, i) => (
                              <div key={i}>
                                {formatDate(d.start)} – {formatDate(d.end)}
                              </div>
                            ))
                          : "—"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="font-bold text-gray-400">Meetup:</span>
                      <span className="text-gray-700 font-medium truncate">{t.address}</span>
                    </div>

                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="font-bold text-gray-400">Details:</span>
                      <div className="text-gray-600 font-medium">
                        <p className={expandedCards[t.id || t._id] ? "" : "line-clamp-2"}>
                          {t.details}
                        </p>
                        {t.details && t.details.length > 80 && (
                          <button
                            onClick={() => toggleExpand(t.id || t._id)}
                            className="text-primary font-bold text-[11px] hover:underline focus:outline-none cursor-pointer mt-1"
                          >
                            {expandedCards[t.id || t._id] ? "See less" : "See more"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
                    <div>
                      <span className="text-gray-450 font-bold block">Rate</span>
                      <span className="text-primary font-extrabold text-sm">
                        ₱{Number(t.joinerPrice).toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-[10px]"> ({t.joinerMaxSlots} slots)</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(tourStatus)}`}>
                      {tourStatus}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {tours.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 font-medium">No tour packages listed yet.</p>
        </div>
      )}

      {/* ===== EDIT/CREATE TOUR DIALOG ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">
              {isEdit ? "Update Tour Package" : "Publish New Tour"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 my-2 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={onChange("title")}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={onChange("category")}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Mountain Climbing</option>
                  <option>Island Hopping</option>
                  <option>Scuba Diving</option>
                  <option>Camping</option>
                  <option>Hiking</option>
                  <option>Nature & Cultural</option>
                  <option>Adventure & Extreme</option>
                  <option>Beach & Relaxation</option>
                </select>
              </div>
            </div>

            <div className="relative" ref={suggestionsRef}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Address / Destination *</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.address}
                  onChange={onChange("address")}
                  placeholder="E.g. Sagada, Mountain Province"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                {suggestionsLoading && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1.5 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none py-1.5 scrollbar-thin">
                  {suggestions.map((item, idx) => {
                    const addr = formatAddressDetail(item);
                    return (
                      <li
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-4 py-2.5 text-xs text-gray-700 hover:bg-brand-light hover:text-primary cursor-pointer transition-colors flex justify-between items-center gap-2 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="font-bold text-gray-900 text-sm truncate">
                            {item.properties?.name || "Unknown Place"}
                          </span>
                          {addr && (
                            <span className="text-gray-500 text-xs truncate">
                              {addr}
                            </span>
                          )}
                        </div>
                        {item.properties?.type && (
                          <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                            {item.properties.type}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>



            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Meetup Locations (comma separated)</label>
              <input
                type="text"
                value={form.meetupLocations}
                onChange={onChange("meetupLocations")}
                placeholder="E.g. Greenfield District, Cubao Farmers"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Available Date Range *</label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                minDate={tomorrow}
                monthsShown={1}
                shouldCloseOnSelect={true}
                dateFormat="MMM d, yyyy"
                portalId="datepicker-portal"
                customInput={
                  <button type="button" className="px-4 py-2 border border-primary text-primary hover:bg-brand-light font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer focus:outline-none select-none">
                    <FaCalendarAlt /> Choose Dates
                  </button>
                }
              />
              {startDate && endDate && (
                <div className="mt-2 text-primary font-semibold text-xs">
                  Selected: {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Details & Description *</label>
              <textarea
                rows="3"
                value={form.details}
                onChange={onChange("details")}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Package Inclusions (comma separated)</label>
              <textarea
                rows="2"
                value={form.packageInclusions}
                onChange={onChange("packageInclusions")}
                placeholder="E.g. Van transfers, coordinator fees, environment passes"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Dynamic Itinerary Days Inputs */}
            {form.itinerary.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">Itinerary Description</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {form.itinerary.map((day, idx) => (
                    <div key={idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50 space-y-2">
                      <strong className="text-xs text-gray-800">Day {idx + 1}</strong>
                      <input
                        placeholder="E.g. Meetup at Greenfield, trek to summit, pitch tents"
                        value={day}
                        onChange={(e) => {
                          const list = [...form.itinerary];
                          list[idx] = e.target.value;
                          setForm((prev) => ({ ...prev, itinerary: list }));
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Things to Bring (one per line)</label>
              <textarea
                rows="2"
                value={form.thingsToBring}
                onChange={onChange("thingsToBring")}
                placeholder="E.g. Sunblock&#10;Extra clothes&#10;Hydration pack"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Joiner Price (₱)</label>
                <input
                  type="number"
                  value={form.joinerPrice}
                  onChange={onChange("joinerPrice")}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Max Joiner Slots</label>
                <input
                  type="number"
                  value={form.joinerMaxSlots}
                  onChange={onChange("joinerMaxSlots")}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Upload Images</label>
              <input
                ref={picturesInputRef}
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={handlePictures}
              />
              <button
                type="button"
                onClick={() => picturesInputRef.current.click()}
                className="px-4 py-2 border border-dashed border-primary text-primary hover:bg-brand-light font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer focus:outline-none select-none w-full justify-center"
              >
                <FaImage /> Upload Images
              </button>

              {form.pictures.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {form.pictures.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100 text-xs"
                    >
                      <span className="truncate max-w-[80%] text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removePicture(idx)}
                        className="text-red-500 hover:text-red-600 focus:outline-none cursor-pointer"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-50 mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Tour" : "Publish Tour"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
