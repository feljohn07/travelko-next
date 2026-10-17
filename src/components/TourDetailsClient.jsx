"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaStar,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/zoom";
import "swiper/css/thumbs";

const normalizeArray = (value) => {
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

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? dateString
    : d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
};

export default function TourDetailsClient({ tour: initialTour, tourId }) {
  const router = useRouter();
  const [tour, setTour] = useState({
    ...initialTour,
    pictureUrls: normalizeArray(initialTour.pictureUrls),
    packageInclusions: normalizeArray(initialTour.packageInclusions),
    itinerary: normalizeArray(initialTour.itinerary),
    thingsToBring: normalizeArray(initialTour.thingsToBring),
    meetupLocations: normalizeArray(initialTour.meetupLocations),
    reviews: Array.isArray(initialTour.reviews) ? initialTour.reviews : [],
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    fullName: "",
    rating: 5,
    content: "",
  });

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const submitReview = async () => {
    if (!reviewForm.fullName || !reviewForm.content) {
      toast.warning("Please complete all fields");
      return;
    }

    try {
      await api.post(`/reviews/${tourId}`, {
        fullName: reviewForm.fullName,
        rating: Number(reviewForm.rating),
        content: reviewForm.content,
      });

      // Refresh data
      const res = await api.get(`/tours/${tourId}`);
      setTour((prev) => ({
        ...prev,
        reviews: Array.isArray(res.data.reviews) ? res.data.reviews : [],
      }));

      toast.success("Review submitted successfully! 🎉");
      setShowReviewModal(false);
      setReviewForm({ fullName: "", rating: 5, content: "" });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error;
      if (Array.isArray(errorMsg)) {
        toast.error(
          <div className="flex flex-col gap-1 text-sm text-left">
            <span className="font-bold">Review failed:</span>
            <ul className="list-disc pl-4 space-y-1">
              {errorMsg.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        toast.error(errorMsg || err.message || "Something went wrong");
      }
    }
  };

  const images = tour.pictureUrls;
  const heroImage =
    images.length > 0 && typeof images[0] === "string" && images[0].startsWith("http")
      ? images[0]
      : "https://via.placeholder.com/1600x500?text=TravelKo+Adventure";

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== HERO HEAD ===== */}
      <div
        className="relative bg-cover bg-center py-24 text-white z-0 overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-[-1]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Badge className="bg-primary hover:bg-brand-dark px-3 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm">
            {tour.category}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            {tour.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <FaStar className="text-yellow-400" /> 4.8 Rating
            </span>
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt /> {tour.address}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ===== GALLERY CARD ===== */}
        <h4 className="font-extrabold text-xl text-gray-900 mb-4">Gallery</h4>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-10 max-w-xl">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onClick={() => setShowGalleryModal(true)}
            className="cursor-zoom-in rounded-xl"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt=""
                  className="h-56 w-full object-cover rounded-xl"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ===== DETAILS GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* About this tour */}
            <div>
              <h4 className="font-extrabold text-xl text-gray-900 mb-3">About this tour</h4>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {tour.details}
              </p>
            </div>

            {/* Itinerary */}
            {tour.itinerary?.length > 0 && (
              <div>
                <h4 className="font-extrabold text-xl text-gray-900 mb-4">Itinerary</h4>
                <div className="space-y-3.5">
                  {tour.itinerary.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <Badge className="bg-primary hover:bg-primary py-1 px-2.5 rounded-full font-bold text-xs select-none shrink-0">
                        Day {idx + 1}
                      </Badge>
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included / Things to Bring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
              <div>
                <h5 className="font-bold text-gray-900 text-base mb-3">What&apos;s included</h5>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                  {tour.packageInclusions?.map((i, idx) => (
                    <li key={idx} className="list-item">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-gray-900 text-base mb-3">Things to bring (Optional)</h5>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                  {tour.thingsToBring?.map((i, idx) => (
                    <li key={idx} className="list-item">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Meetup Locations */}
            {tour.meetupLocations?.length > 0 && (
              <div className="border-t border-gray-100 pt-8">
                <h4 className="font-extrabold text-xl text-gray-900 mb-3">Meetup Locations</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                  {tour.meetupLocations.map((i, idx) => (
                    <li key={idx} className="list-item">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column (Coordinator details and booking buttons) */}
          <aside className="space-y-6">
            {/* Coordinator box */}
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
              <h4 className="font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-50">
                Tour Coordinator
              </h4>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary text-lg">
                  <FaUser />
                </div>
                <div>
                  <h6 className="font-bold text-gray-800 text-sm">
                    {tour.coordinator?.businessName || "Adventure Pro Tour"}
                  </h6>
                  <p className="text-gray-400 text-xs mt-0.5">Verified Host</p>
                </div>
              </div>

              {/* Private tour booking shortcut link */}
              <Link
                href={`/book?tourId=${tourId}&mode=private`}
                className="text-primary font-bold text-sm hover:underline block"
              >
                Book a Private Tour »
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col gap-3">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-450 block font-medium">Joiner Slots Left</span>
                <span className="font-extrabold text-2xl text-primary">
                  ₱{Number(tour.joinerPrice).toLocaleString()}
                </span>
                <span className="text-gray-500 text-xs font-semibold"> / pax</span>
              </div>

              <Link
                href={`/book?tourId=${tourId}`}
                className="w-full py-3 bg-primary hover:bg-brand-dark text-white rounded-full font-bold text-sm text-center shadow-md select-none block"
              >
                Book Joiner Tour
              </Link>
              <Link
                href="/tours"
                className="w-full py-3 border border-gray-200 text-gray-700 rounded-full font-bold text-sm text-center hover:bg-gray-50 transition-colors select-none block"
              >
                Back to Tours
              </Link>
            </div>
          </aside>
        </div>

        {/* ===== REVIEWS SLIDER ===== */}
        <div className="mt-14 border-t border-gray-100 pt-10">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-extrabold text-xl text-gray-900">Reviews & Comments</h4>
            <Button
              onClick={() => setShowReviewModal(true)}
              className="rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
            >
              + Leave Review
            </Button>
          </div>

          {tour.reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
          ) : (
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
              }}
              className="pb-10"
            >
              {tour.reviews.map((r, idx) => (
                <SwiperSlide key={r._id || r.id || idx}>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-gray-800 text-sm">{r.fullName}</strong>
                        <small className="text-gray-400 text-xs">{formatDate(r.createdAt)}</small>
                      </div>
                      <div className="flex gap-0.5 text-yellow-400 mb-2">
                        {[...Array(Number(r.rating || 5))].map((_, i) => (
                          <FaStar key={i} size={11} />
                        ))}
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">{r.content}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      {/* ===== LEAVE REVIEW DIALOG ===== */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-gray-900">Leave a Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                value={reviewForm.fullName}
                onChange={(e) =>
                  setReviewForm((p) => ({ ...p, fullName: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                    className="focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                  >
                    <FaStar
                      size={star <= reviewForm.rating ? 24 : 20}
                      color={star <= reviewForm.rating ? "#FACC15" : "#E5E7EB"}
                    />
                  </button>
                ))}
              </div>
              <small className="text-gray-400 text-xs block mt-1">{reviewForm.rating} out of 5</small>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Comment</label>
              <textarea
                rows="3"
                value={reviewForm.content}
                onChange={(e) =>
                  setReviewForm((p) => ({ ...p, content: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview}>
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== GALLERY ZOOM DIALOG ===== */}
      <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
        <DialogContent className="max-w-[92vw] md:max-w-4xl p-2 border-0 bg-black/95">
          {/* Main Swiper */}
          <Swiper
            modules={[Zoom, Navigation, Thumbs]}
            zoom
            navigation
            initialSlide={activeIndex}
            thumbs={
              thumbsSwiper && !thumbsSwiper.destroyed ? { swiper: thumbsSwiper } : undefined
            }
            className="h-[55vh] md:h-[65vh]"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx} className="flex items-center justify-center">
                <div className="swiper-zoom-container flex items-center justify-center">
                  <img
                    src={img}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnails Swiper */}
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={Math.min(images.length, 6)}
            watchSlidesProgress
            className="mt-3 cursor-pointer"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt=""
                  className="h-14 w-full object-cover rounded-lg border border-transparent hover:border-primary"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </DialogContent>
      </Dialog>
    </div>
  );
}
