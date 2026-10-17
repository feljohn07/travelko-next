/**
 * Centralized tour status utility for TravelKo.
 * Ensures consistent and accurate status calculation across coordinator dashboard,
 * tours list, bookings, and admin views.
 */

export const parseAvailableDates = (availableDates) => {
  if (!availableDates) return [];

  let arr = availableDates;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      arr = [arr];
    }
  }

  if (!Array.isArray(arr) || arr.length === 0) return [];

  const dates = arr
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));

  if (dates.length === 0) return [];

  // Sort chronologically
  dates.sort((a, b) => a - b);

  return [{ start: dates[0], end: dates[dates.length - 1] }];
};

export const getTourTimeStatus = (tour) => {
  if (!tour) return "draft";

  // 1. Explicit cancellation check on tour model
  const rawStatus = (tour.status || "").toLowerCase().trim();
  if (rawStatus === "cancelled" || rawStatus === "canceled" || tour.isCancelled) {
    return "cancelled";
  }

  // 2. Check if all bookings inside the tour are cancelled
  if (
    Array.isArray(tour.bookings) &&
    tour.bookings.length > 0 &&
    tour.bookings.every((b) => (b.status || "").toLowerCase().trim() === "cancelled")
  ) {
    return "cancelled";
  }

  // 3. Explicit completion check
  if (rawStatus === "completed") {
    return "completed";
  }

  // 4. Calculate date-based status
  const dates = parseAvailableDates(tour.availableDates);
  if (!dates.length) return rawStatus || "draft";

  const today = new Date();
  const start = new Date(dates[0].start);
  const end = new Date(dates[0].end);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (today < start) return "upcoming";
  if (today >= start && today <= end) return "ongoing";
  if (today > end) return "completed";

  return rawStatus || "draft";
};

export const getTourStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()?.trim()) {
    case "ongoing":
      return "text-green-600 bg-green-50";
    case "completed":
      return "text-blue-600 bg-blue-50";
    case "upcoming":
      return "text-yellow-600 bg-yellow-50";
    case "cancelled":
    case "canceled":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
};

export const formatTourDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
