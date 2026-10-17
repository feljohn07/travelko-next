"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaUsers,
  FaUserFriends,
  FaMoneyBillWave,
  FaUniversity,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toLocalYYYYMMDD = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function BookAdventureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tourId = searchParams.get("tourId");
  const modeParam = searchParams.get("mode") || "normal";
  const isPrivateBooking = modeParam === "private";

  const [tour, setTour] = useState(null);
  const [loadingTour, setLoadingTour] = useState(true);
  const [bookingType, setBookingType] = useState(isPrivateBooking ? "solo" : "group");

  const [people, setPeople] = useState(1);
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateRanges, setDateRanges] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    specialRequests: "",
  });

  const selectedDate =
    bookingType === "solo"
      ? startDate && endDate
        ? { start: startDate, end: endDate }
        : null
      : dateRanges[0] || null;

  useEffect(() => {
    if (!tourId) {
      toast.error("Invalid booking session. Please select a tour.");
      router.push("/tours");
      return;
    }

    const fetchTour = async () => {
      try {
        const res = await api.get("/tours");
        const allTours = res.data;
        const matchedTour = allTours.find(
          (t) => String(t._id) === String(tourId) || String(t.id) === String(tourId)
        );

        if (!matchedTour) {
          toast.error("Tour not found.");
          router.push("/tours");
          return;
        }

        const todayUTCString = new Date().toISOString().substring(0, 10);
        const filteredDates = (matchedTour.availableDates || []).filter(
          (dateString) => dateString.substring(0, 10) > todayUTCString
        );

        setTour(matchedTour);
        setDateRanges(
          filteredDates.map((dateString) => ({
            raw: dateString,
            display: new Date(dateString),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch tour details", err);
        router.push("/tours");
      } finally {
        setLoadingTour(false);
      }
    };

    fetchTour();
  }, [tourId, router]);

  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const unitPrice =
    bookingType === "group"
      ? Number(tour?.joinerPrice || 0)
      : Number(tour?.privateBookingPrice || tour?.joinerPrice || 0);

  const totalAmount = bookingType === "group" ? unitPrice * people : unitPrice;

  const handleConfirmBooking = async () => {
    if (!agreeTerms) {
      toast.warning("Please agree to the Terms and Conditions first.");
      return;
    }
    if (!payment) {
      toast.warning("Please select a payment method.");
      return;
    }
    if (!selectedDate) {
      toast.warning("Please select a date range.");
      return;
    }
    if (!form.fullName || !form.fullName.trim()) {
      toast.warning("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    const cleanPhone = form.phoneNumber ? form.phoneNumber.replace(/[\s\-\(\)]/g, "") : "";
    const phPhoneRegex = /^(?:\+63|0)?9\d{9}$/;
    if (!cleanPhone || !phPhoneRegex.test(cleanPhone)) {
      toast.warning("Please enter a valid Philippines phone number (e.g. +639181234567 or 09181234567).");
      return;
    }

    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith("0")) {
      formattedPhone = "+63" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("9")) {
      formattedPhone = "+63" + cleanPhone;
    }

    setLoading(true);

    const datesArray =
      bookingType === "group"
        ? dateRanges.map((d) => d.raw)
        : [toLocalYYYYMMDD(selectedDate.start), toLocalYYYYMMDD(selectedDate.end)];

    const payload = {
      bookingType: bookingType === "group" ? "joiner" : "private",
      bookingIndividuals: bookingType === "group" ? people : 1,
      tourDateSelected: datesArray,
      paymentMethod: payment || "gcash",
      specialRequests: form.specialRequests || "",
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: formattedPhone,
      accountName: form.accountName?.trim() || form.fullName.trim(),
      refundMethod: form.refundMethod || payment || "gcash",
      accountNumber: form.accountNumber?.trim() || formattedPhone,
    };

    try {
      const res = await api.post(`/booking/${tourId}`, payload);
      if (res.data && typeof res.data === "string" && res.data.startsWith("http")) {
        window.open(res.data, "_blank");
      }
      setBookingRef(`BK-${Date.now()}`);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        toast.error(
          <div className="flex flex-col gap-1 text-sm text-left">
            <span className="font-bold">Booking failed:</span>
            <ul className="list-disc pl-4 space-y-1">
              {errorMsg.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        toast.error(errorMsg || "Booking request failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingTour || !tour) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const bgImage = tour.pictureUrls?.[0] || "";

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== HERO BACKGROUND ===== */}
      <div
        className="relative h-64 bg-cover bg-center flex items-center text-white z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-[-1]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {isPrivateBooking ? "Private Adventure Booking" : "Book Your Adventure"}
          </h1>
          <p className="text-gray-200 text-sm">{tour.title}</p>
        </div>
      </div>

      {/* ===== FORM FIELDS ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h5 className="font-bold text-lg text-gray-900 mb-2">Personal Information</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={onChange("fullName")}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      placeholder="Enter your email"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={form.phoneNumber}
                      onChange={onChange("phoneNumber")}
                      placeholder="Enter your number"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={onChange("address")}
                      placeholder="Enter your address"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Settings */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h5 className="font-bold text-lg text-gray-900 mb-2">Booking Type</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <button
                    onClick={() => setBookingType("solo")}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      bookingType === "solo"
                        ? "bg-primary border-primary text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaUsers /> Private / Solo
                  </button>

                  {!isPrivateBooking && (
                    <button
                      onClick={() => setBookingType("group")}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        bookingType === "group"
                          ? "bg-primary border-primary text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaUserFriends /> Join Group (₱{tour.joinerPrice})
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Number of Individuals
                  </label>
                  <select
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {(bookingType === "group"
                      ? Array.from({ length: tour.joinerMaxSlots || 1 }, (_, i) => i + 1)
                      : Array.from({ length: 20 }, (_, i) => i + 1)
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n} pax
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    rows="3"
                    value={form.specialRequests}
                    onChange={onChange("specialRequests")}
                    placeholder="E.g., dietary restrictions, bed preferences, meetup queries"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Pickers */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h5 className="font-bold text-lg text-gray-900 mb-1">
                  {bookingType === "solo" ? "Select Custom Dates" : "Tour Dates"}
                </h5>

                {bookingType === "solo" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      Pick private tour range
                    </label>
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      minDate={tomorrow}
                      monthsShown={1}
                      shouldCloseOnSelect={true}
                      dateFormat="MMM d, yyyy"
                      customInput={
                        <button className="px-5 py-2.5 border border-primary text-primary hover:bg-brand-light font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer focus:outline-none select-none">
                          <FaCalendarAlt /> Choose Dates
                        </button>
                      }
                      popperPlacement="bottom-start"
                    />

                    {startDate && endDate && (
                      <div className="mt-3 text-primary font-bold text-sm">
                        Selected: {formatDate(startDate)} – {formatDate(endDate)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {dateRanges.length === 0 ? (
                      <p className="text-gray-400 text-sm">No scheduled dates.</p>
                    ) : (
                      <div className="text-primary font-bold text-sm mt-1">
                        Scheduled: {formatDate(dateRanges[0].display)} – {formatDate(dateRanges[dateRanges.length - 1].display)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h5 className="font-bold text-lg text-gray-900 mb-2">Payment Details</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPayment("gcash")}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      payment === "gcash"
                        ? "bg-primary border-primary text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaMoneyBillWave /> GCash Wallet
                  </button>

                  <button
                    onClick={() => setPayment("bank-transfer")}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      payment === "bank-transfer"
                        ? "bg-primary border-primary text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaUniversity /> Bank Transfer
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Terms Consent */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-sm text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded text-primary border-gray-300 focus:ring-primary focus:ring-offset-0 focus:outline-none cursor-pointer mt-1"
                  />
                  <span>
                    I hereby read and agree on the{" "}
                    <Link href="/terms" className="text-primary font-bold hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    stated by Travelko.
                  </span>
                </label>
                <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed">
                  For international adventures, full payments must be settled at least <strong>30 days before</strong> departure date.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SUMMARY SIDEBAR */}
          <aside className="h-fit">
            <Card className="rounded-2xl border-gray-100 shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h5 className="font-bold text-lg text-gray-900 border-b border-gray-50 pb-2 mb-2">
                  Booking Summary
                </h5>
                <h6 className="font-extrabold text-gray-950 text-base">{tour.title}</h6>

                <div className="space-y-2 text-xs text-gray-600">
                  <p>
                    <strong className="text-gray-800">Booking Type:</strong>{" "}
                    {bookingType === "group" ? `Joiner Group (${people} pax)` : "Private Tour"}
                  </p>
                  <p>
                    <strong className="text-gray-800">Dates:</strong>{" "}
                    {selectedDate
                      ? bookingType === "solo"
                        ? `${formatDate(selectedDate.start)} – ${formatDate(selectedDate.end)}`
                        : `${formatDate(dateRanges[0]?.display)} – ${formatDate(dateRanges[dateRanges.length - 1]?.display)}`
                      : "Not selected"}
                  </p>
                  <p>
                    <strong className="text-gray-800">Payment:</strong>{" "}
                    {payment ? payment.toUpperCase().replace("-", " ") : "Not chosen"}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2">
                  <span className="text-[10px] text-gray-450 block font-medium">Total Bill</span>
                  <h4 className="text-primary font-extrabold text-2xl">
                    ₱{totalAmount.toLocaleString()}
                  </h4>
                </div>

                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading || !agreeTerms}
                  className="w-full py-6 text-sm font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md select-none mt-4 cursor-pointer"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* ===== SUCCESS DIALOG ===== */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md p-6 flex flex-col items-center text-center">
          <FaCheckCircle size={70} className="text-primary mb-3" />
          <h4 className="font-bold text-lg text-gray-900 mb-1">Booking Request Sent!</h4>
          <p className="text-gray-400 text-xs mb-5 max-w-xs leading-normal">
            We will review and confirm your booking request details within <strong>24 hours</strong>.
          </p>
          <span className="text-xs text-primary font-bold mb-6">Ref No: {bookingRef}</span>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => {
                setShowSuccess(false);
                router.push("/tours");
              }}
              className="flex-1 py-2.5 text-xs font-bold bg-primary hover:bg-brand-dark text-white rounded-xl focus:outline-none cursor-pointer"
            >
              Browse Tours
            </button>
            <button
              onClick={() => {
                setShowSuccess(false);
                router.push("/tours");
              }}
              className="flex-1 py-2.5 text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl focus:outline-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookAdventure() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <BookAdventureContent />
    </Suspense>
  );
}
