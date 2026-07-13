"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaMapMarkerAlt, FaList, FaStar, FaChevronRight, FaSearch } from "react-icons/fa";

// Dynamically import MapComponent to disable server-side rendering (since Leaflet relies on browser APIs)
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-semibold text-sm">Loading interactive map...</p>
    </div>
  ),
});

const normalize = (str = "") => String(str).trim().toLowerCase();

const parseAvailableDates = (availableDates) => {
  if (!Array.isArray(availableDates) || availableDates.length === 0)
    return null;

  const dates = availableDates
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));

  if (dates.length === 0) return null;

  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
};

const formatDate = (d) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const CATEGORIES = [
  { id: "all", label: "All Adventures" },
  { id: "Mountain", label: "Mountain" },
  { id: "Island", label: "Island Hopping" },
  { id: "Scuba", label: "Scuba Diving" },
  { id: "Camping", label: "Camping" },
  { id: "Hiking", label: "Hiking" },
];

export default function MapClient({ tours = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [mobileTab, setMobileTab] = useState("list"); // 'list' or 'map'

  // Filter tours
  const filteredTours = useMemo(() => {
    let list = [...tours];

    const qQuery = normalize(searchQuery);
    const qCat = normalize(selectedCategory);

    if (qQuery) {
      list = list.filter(
        (t) =>
          normalize(t.title).includes(qQuery) ||
          normalize(t.address).includes(qQuery)
      );
    }

    if (qCat && qCat !== "all") {
      list = list.filter((t) => normalize(t.category).includes(qCat));
    }

    return list;
  }, [tours, searchQuery, selectedCategory]);

  const handleSelectTour = (tourId) => {
    setSelectedTourId(tourId);
    // Auto switch to map view on mobile if a tour is selected
    if (mobileTab === "list") {
      setMobileTab("map");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] w-full overflow-hidden bg-white relative">
      
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`w-full lg:w-[400px] xl:w-[440px] shrink-0 border-r border-gray-100 flex flex-col h-full bg-white transition-all duration-300 z-20 ${
          mobileTab === "list" ? "flex" : "hidden lg:flex"
        }`}
      >
        {/* Search & Filters */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Tours Map Explorer</h1>
          
          {/* Search bar */}
          <div className="relative mb-3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400"
            />
          </div>

          {/* Category Quick Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tour List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => {
              const dates = parseAvailableDates(tour.availableDates);
              const isSelected = tour.id === selectedTourId || tour._id === selectedTourId;

              return (
                <div
                  key={tour.id || tour._id}
                  onClick={() => handleSelectTour(tour.id || tour._id)}
                  className={`p-3 bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                    isSelected
                      ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                      : "border-gray-100 hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                    <img
                      src={tour.pictureUrls?.[0] || "/tour1.jpg"}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Tour details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="px-2 py-0.5 bg-brand-light text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                          {tour.category}
                        </span>
                        <div className="flex items-center gap-0.5 text-xs font-semibold text-yellow-500">
                          <FaStar size={10} />
                          <span>4.8</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 line-clamp-1 leading-snug">
                        {tour.title}
                      </h3>

                      <p className="text-gray-400 text-[11px] flex items-center gap-0.5 mt-0.5">
                        <FaMapMarkerAlt size={10} className="text-primary shrink-0" />
                        <span className="truncate">{tour.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100/65">
                      <div>
                        <span className="text-primary font-extrabold text-sm">
                          ₱{Number(tour.joinerPrice).toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-[10px]"> / pax</span>
                      </div>
                      <span className="text-gray-400 text-[10px] font-medium">
                        {tour.joinerMaxSlots - (tour.joinerBookedSlots || 0)} left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-gray-400 text-sm font-medium">No tours match your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-3 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAP PANEL ===== */}
      <main
        className={`flex-1 h-full relative ${
          mobileTab === "map" ? "block" : "hidden lg:block"
        }`}
      >
        <MapComponent
          tours={filteredTours}
          selectedTourId={selectedTourId}
          onSelectTour={setSelectedTourId}
        />
      </main>

      {/* ===== MOBILE FLOATING VIEW TOGGLE ===== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <button
          onClick={() => setMobileTab(mobileTab === "list" ? "map" : "list")}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-bold shadow-lg hover:bg-brand-dark transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {mobileTab === "list" ? (
            <>
              <FaMapMarkerAlt /> Show Map View
            </>
          ) : (
            <>
              <FaList /> Show List View
            </>
          )}
        </button>
      </div>

    </div>
  );
}
