"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function BookPrivateTourContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");

  const [tour, setTour] = useState(null);
  const [loadingTour, setLoadingTour] = useState(true);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [accountName, setAccountName] = useState("");
  const [refundMethod, setRefundMethod] = useState("gcash");
  const [accountNumber, setAccountNumber] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tourId) {
      toast.error("Invalid booking session. Select a tour.");
      router.push("/tours");
      return;
    }

    const fetchTour = async () => {
      try {
        const res = await api.get("/tours");
        const matched = res.data.find(
          (t) => String(t._id) === String(tourId) || String(t.id) === String(tourId)
        );
        if (!matched) {
          toast.error("Tour not found.");
          router.push("/tours");
          return;
        }
        const todayUTCString = new Date().toISOString().substring(0, 10);
        const filteredDates = (Array.isArray(matched.availableDates) ? matched.availableDates : []).filter(
          (dateString) => dateString.substring(0, 10) > todayUTCString
        );
        setTour({
          id: matched._id || matched.id,
          title: matched.title,
          subtitle: matched.category,
          image: matched.pictureUrls?.[0] || "/tour1.jpg",
          price: matched.privateBookingPrice || matched.joinerPrice || 3500,
          availableDates: filteredDates,
        });
      } catch (err) {
        console.error("Failed to load private tour details", err);
        router.push("/tours");
      } finally {
        setLoadingTour(false);
      }
    };

    fetchTour();
  }, [tourId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !phone) {
      toast.warning("Please complete all required fields.");
      return;
    }
    if (!selectedDate) {
      toast.warning("Please select a date.");
      return;
    }
    if (!accountName.trim()) {
      toast.warning("Please enter your refund account name.");
      return;
    }
    if (!accountNumber.trim()) {
      toast.warning("Please enter your refund account or wallet number.");
      return;
    }
    if (!agree) {
      toast.warning("You must agree to the Terms & Conditions.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    const cleanPhone = phone ? phone.replace(/[\s\-\(\)]/g, "") : "";
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

    const payload = {
      bookingType: "private",
      bookingIndividuals: 1,
      tourDateSelected: [selectedDate],
      paymentMethod: "gcash", // Default private demo payment
      specialRequests: notes || "",
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: formattedPhone,
      accountName: accountName.trim() || fullName.trim(),
      refundMethod: refundMethod || "gcash",
      accountNumber: accountNumber.trim() || formattedPhone,
    };

    try {
      const res = await api.post(`/booking/${tour.id}`, payload);
      if (res.data && typeof res.data === "string" && res.data.startsWith("http")) {
        window.open(res.data, "_blank");
      }
      toast.success("Private booking request sent! 🎉");
      router.push("/tours");
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
        toast.error(errorMsg || "Booking failed.");
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header Image Banner */}
        <div className="relative h-44 bg-gray-100 z-0">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover brightness-[0.75]"
          />
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
            <h2 className="font-extrabold text-xl leading-tight">
              Book Your Private <br /> Adventure
            </h2>
            <p className="text-gray-200 text-xs mt-1">{tour.subtitle || tour.title}</p>
          </div>
        </div>

        {/* Card Form Body */}
        <CardContent className="p-6 md:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Details */}
            <div>
              <h5 className="font-bold text-gray-900 text-sm mb-3">Personal Information</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 900 000 0000"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="pt-2">
              <h5 className="font-bold text-gray-900 text-sm mb-3">Booking Details</h5>
              <div className="space-y-3">
                {/* Booking Type display */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Booking Type *</label>
                  <div className="p-4 rounded-xl border border-primary bg-primary/5 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FaUser size={14} />
                      </div>
                      <div>
                        <h6 className="font-bold text-gray-900 text-xs">Private Booking</h6>
                        <p className="text-[10px] text-gray-450 leading-tight mt-0.5">
                          Exclusive experience for you and your group.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-primary block">{peso(tour.price)}</span>
                      <span className="text-[10px] text-gray-400">1-4 pax</span>
                    </div>
                  </div>
                </div>

                {/* Date Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Select Date *</label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Choose a date</option>
                    {tour.availableDates.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special requests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Special Requests or Notes</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                    placeholder="Any dietary restrictions, medical conditions, or special requirements..."
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">{notes.length}/500 Characters</span>
                </div>
              </div>
            </div>

            {/* Refund Account Details */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Refund Account Details</h5>
                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                    For refunds in case of tour cancellation or rescheduling
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountName(fullName);
                    setAccountNumber(phone);
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Same as contact info
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Refund Account Name *
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Refund Method *
                    </label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="gcash">gcash</option>
                      <option value="bank">bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Refund Account Number *
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={refundMethod === "gcash" ? "e.g. 09181234567" : "Bank account number"}
                      required
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 text-xs text-gray-700 leading-normal border-t border-gray-50 pt-4">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                disabled={loading}
                className="rounded text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5 shrink-0"
              />
              <div>
                <span>I hereby read and agree on the </span>
                <Link href="/terms" className="text-primary font-bold hover:underline">
                  Terms and Conditions
                </Link>
                <span> stated by TravelKo.</span>
                <p className="text-[10px] text-gray-450 mt-1.5 font-medium leading-relaxed">
                  For international hikes, all payments should be settled at least 30 days before departure date.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-150 pt-4 space-y-2 text-xs">
              <h6 className="font-bold text-gray-800 text-sm">Booking Summary</h6>
              <div className="flex justify-between">
                <span className="text-gray-500">Tour:</span>
                <span className="font-bold text-gray-900 max-w-[240px] truncate text-right">{tour.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-bold text-gray-900">{selectedDate ? formatDate(selectedDate) : "Not selected"}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                <span className="font-extrabold text-sm text-gray-800">Total Amount:</span>
                <span className="font-extrabold text-lg text-primary">{peso(tour.price)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                type="submit"
                disabled={loading || !agree}
                className="w-full py-5 text-xs font-bold bg-primary hover:bg-brand-dark rounded-xl cursor-pointer"
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </Button>
              <Link
                href="/tours"
                className="w-full py-2.5 text-xs font-bold text-center border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors select-none"
              >
                Back to Tours
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookPrivateTour() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <BookPrivateTourContent />
    </Suspense>
  );
}
