"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { FaThumbsUp } from "react-icons/fa";
import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "Mary Grace Gallardo",
    location: "Davao City, Philippines",
    rating: 5,
    comment:
      "TravelKo made our trip smooth and unforgettable. Super easy booking and great coordinators!",
    avatar: "https://i.pravatar.cc/100?img=32",
    verified: true,
  },
  {
    name: "Juan Dela Cruz",
    location: "Cebu City, Philippines",
    rating: 4,
    comment: "Highly recommended! The experience was worth every peso.",
    avatar: "https://i.pravatar.cc/100?img=12",
    verified: true,
  },
  {
    name: "Angela Reyes",
    location: "Manila, Philippines",
    rating: 5,
    comment:
      "Best travel platform so far. Friendly coordinators and clear itineraries.",
    avatar: "https://i.pravatar.cc/100?img=47",
    verified: false,
  },
];

const renderStars = (rating) => "⭐".repeat(rating) + "☆".repeat(5 - rating);

export default function TestimonialsCarousel() {
  const [likes, setLikes] = useState(TESTIMONIALS.map(() => 0));
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const handleLike = (index) => {
    const updated = [...likes];
    updated[index]++;
    setLikes(updated);
  };

  const goToSlide = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-bold text-3xl text-gray-900 mb-2">
          What Travelers Say
        </h2>
        <p className="text-center text-gray-500 text-sm mb-10 max-w-lg mx-auto">
          Real experiences from our amazing community of adventurers
        </p>

        <div className="relative max-w-2xl mx-auto">
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            slidesPerView={1}
            loop={true}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full"
          >
            {TESTIMONIALS.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mx-auto max-w-xl">
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h6 className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {item.name}
                        {item.verified && (
                          <span className="text-green-500 text-xs" title="Verified Traveler">✔</span>
                        )}
                      </h6>
                      <small className="text-gray-400 text-xs">
                        {item.location}
                      </small>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="mt-2 text-xs select-none">
                    {renderStars(item.rating)}
                  </div>

                  {/* Comment */}
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>

                  {/* Interactivity */}
                  <div className="mt-4 flex gap-4 text-xs text-gray-400 select-none">
                    <button
                      onClick={() => handleLike(index)}
                      className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none cursor-pointer"
                    >
                      <FaThumbsUp /> Helpful ({likes[index]})
                    </button>
                    <span>💬 Comment</span>
                    <span>· 2 days ago</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Dots Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "bg-primary w-6" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
