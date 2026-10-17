"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaShareAlt, FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const POPULAR_LOCATIONS = [
  "Mount Pinatubo",
  "El Nido, Palawan",
  "Bohol",
  "Baguio",
  "Mount Pulag",
  "Boracay",
  "Siargao",
  "Cebu",
];

export default function ToursClient({ initialTours, initialCategory }) {
  const router = useRouter();

  // Filters State
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [location, setLocation] = useState("");
  const [adventureType, setAdventureType] = useState(initialCategory || "all");

  const clearAll = () => {
    setDateRange([null, null]);
    setLocation("");
    setAdventureType("all");
  };

  const filteredTours = useMemo(() => {
    let list = [...initialTours];

    const qLocation = normalize(location);
    const qType = normalize(adventureType);

    if (qLocation) {
      list = list.filter((t) => normalize(t.address).includes(qLocation));
    }

    if (qType && qType !== "all") {
      list = list.filter((t) => normalize(t.category).includes(qType));
    }

    if (startDate && endDate) {
      list = list.filter((t) => {
        if (!t.availableDates || t.availableDates.length === 0) return false;

        const searchStart = new Date(startDate);
        searchStart.setHours(0, 0, 0, 0);

        const searchEnd = new Date(endDate);
        searchEnd.setHours(23, 59, 59, 999);

        return t.availableDates.some((dateStr) => {
          const tourDate = new Date(dateStr);
          tourDate.setHours(0, 0, 0, 0);
          return tourDate >= searchStart && tourDate <= searchEnd;
        });
      });
    }

    return list;
  }, [initialTours, location, adventureType, startDate, endDate]);

  const copyTourLink = async (tourId) => {
    const url = `${window.location.origin}/tours/details/${tourId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== HERO COLLAGE ===== */}
      <section className="relative h-[280px] md:h-[400px] w-full overflow-hidden">
        {/* Image Collage Grid */}
        <div className="grid grid-cols-2 h-full w-full max-w-7xl mx-auto">
          <img src="/tour1.jpg" alt="Tour 1" className="w-full h-full object-cover" />
          <img src="/tour2.png" alt="Tour 2" className="w-full h-full object-cover" />
          <img src="/tour3.jpg" alt="Tour 3" className="w-full h-full object-cover" />
          <img src="/tour4.jpg" alt="Tour 4" className="w-full h-full object-cover" />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-1" />
        {/* Text */}
        <div className="absolute inset-0 z-2 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-extrabold text-3xl md:text-5xl mb-2 tracking-tight">
            Discover Amazing Tours
          </h1>
          <p className="text-gray-200 text-sm md:text-lg">
            Find your perfect adventure with our expert coordinators
          </p>
        </div>
      </section>

      {/* ===== CONTENT SECTION ===== */}
      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ================= LEFT SEARCH PANEL ================= */}
            <aside className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
                  <h6 className="font-bold text-gray-900">Search Tours</h6>
                  <button
                    onClick={clearAll}
                    className="text-primary text-xs font-semibold hover:underline focus:outline-none cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Search by Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        placeholderText="Select date range"
                        className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400"
                        dateFormat="MMM d, yyyy"
                        isClearable={true}
                        wrapperClassName="w-full"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <FaCalendarAlt size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Location Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Search by Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mt. Pinatubo"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400"
                    />
                  </div>

                  {/* Popular locations shortcuts */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Popular Locations
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {POPULAR_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => setLocation(loc)}
                          className="px-2.5 py-1 bg-gray-50 text-[11px] text-gray-600 font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Adventure Type select */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Adventure Type
                    </label>
                    <select
                      value={adventureType}
                      onChange={(e) => setAdventureType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-700 bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="Mountain">Mountain Climbing</option>
                      <option value="Island">Island Hopping</option>
                      <option value="Scuba">Scuba Diving</option>
                      <option value="Camping">Camping</option>
                      <option value="Hiking">Hiking</option>
                    </select>
                  </div>
                </div>
              </div>
            </aside>

            {/* ================= RIGHT TOUR LIST ================= */}
            <main className="flex-grow">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">Available Tours</h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {filteredTours.length} tour{filteredTours.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {filteredTours.map((tour, index) => {
                  const dates = parseAvailableDates(tour.availableDates);

                  return (
                    <div
                      key={`${tour._id || tour.id || 'tour'}-${index}`}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row h-fit md:h-64"
                    >
                      {/* Image */}
                      <div className="relative w-full md:w-2/5 shrink-0 bg-gray-50 h-52 md:h-full">
                        <img
                          src={tour.pictureUrls?.[0] || "/tour1.jpg"}
                          alt={tour.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex flex-col flex-1 min-w-0 h-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-1 bg-brand-light text-primary text-xs font-bold rounded-lg leading-none">
                            {tour.category}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Stars rating */}
                            <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
                              <FaStar size={11} className="shrink-0" />
                              <span>4.8</span>
                            </div>
                            {/* Share button */}
                            <button
                              onClick={() => copyTourLink(tour._id || tour.id)}
                              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none cursor-pointer"
                              title="Copy tour link"
                            >
                              <FaShareAlt size={12} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {tour.title}
                        </h3>
                        <p className="text-gray-400 text-xs flex items-center gap-1 mb-2">
                          <FaMapMarkerAlt className="text-primary shrink-0" />
                          <span className="truncate">{tour.address}</span>
                        </p>
                        <p className="text-gray-500 text-xs font-semibold mb-3">
                          {dates
                            ? `${formatDate(dates.start)} – ${formatDate(dates.end)}`
                            : "Flexible Dates"}
                        </p>
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
                          {tour.details}
                        </p>

                        {/* Price and CTAs */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-50">
                          <div className="text-sm font-bold text-gray-800">
                            <span className="text-primary font-extrabold text-lg">
                              ₱{Number(tour.joinerPrice).toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-xs font-medium">
                              {" "}
                              / pax • {tour.joinerMaxSlots} slots
                            </span>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <Link
                              href={`/book?tourId=${tour._id || tour.id}`}
                              className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg text-center"
                            >
                              Book Now
                            </Link>
                            <Link
                              href={`/tours/details/${tour._id || tour.id}`}
                              className="flex-1 sm:flex-none px-4 py-2 border border-primary text-primary hover:bg-brand-light text-xs font-bold rounded-lg text-center"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredTours.length === 0 && (
                  <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                    <p className="text-gray-400 font-medium">No tours matching your filter criteria.</p>
                    <button
                      onClick={clearAll}
                      className="mt-3 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
