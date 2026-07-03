import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaClock,
  FaSearch,
  FaHeart,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaStar,
  FaCheckCircle,
  FaCreditCard,
  FaMoneyBillWave,
  FaTrophy,
  FaMobileAlt,
} from "react-icons/fa";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

const getDurationLabel = (availableDates) => {
  if (!Array.isArray(availableDates) || availableDates.length === 0)
    return "Flexible dates";

  let range = availableDates[0];

  if (typeof range === "string") {
    try {
      range = JSON.parse(range);
    } catch {
      return "Flexible dates";
    }
  }

  if (!Array.isArray(range) || range.length < 2) return "Flexible dates";

  const start = new Date(range[0]);
  const end = new Date(range[range.length - 1]);

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return `${days} Day${days > 1 ? "s" : ""}`;
};

export default async function HomePage() {
  let tours = [];
  let featuredTours = [];
  let categories = [];

  // Single fetch call resolving Bug #3 (duplicate API calls)
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelko.site/"}tours`,
      { next: { revalidate: 60 } } // ISR: refresh cache every 60 seconds
    );
    if (res.ok) {
      tours = await res.json();
      featuredTours = tours.slice(0, 3);

      // Build categories count dynamically
      const catMap = {};
      tours.forEach((tour) => {
        if (!tour.category) return;
        if (!catMap[tour.category]) {
          catMap[tour.category] = {
            name: tour.category,
            count: 0,
            image: tour.pictureUrls?.[0] || "/tour1.jpg",
          };
        }
        catMap[tour.category].count++;
      });
      categories = Object.values(catMap);
    }
  } catch (err) {
    console.error("Failed to fetch tours server-side", err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== HERO SECTION with VIDEO BACKGROUND ===== */}
      <section className="relative h-[480px] md:h-[600px] w-full overflow-hidden flex items-center justify-center">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/landingPage.png"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/heroVideo.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 z-1" />

        {/* Hero Content */}
        <div className="relative z-2 text-center max-w-3xl px-4 flex flex-col items-center">
          <h1 className="text-white font-bold leading-tight tracking-tight text-3xl md:text-5xl lg:text-6xl mb-6">
            Discover Your Next <br className="hidden sm:inline" />
            <span className="text-primary">Adventure</span> with{" "}
            <span className="font-brand text-primary font-normal">TravelKo</span>
          </h1>
          <p className="text-gray-200 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
            Explore breathtaking destinations, connect with experienced local coordinators, and create memories that last a lifetime.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/tours"
              className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-brand-dark transition-all text-center shadow-md select-none"
            >
              Explore Tours
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-gray-900 transition-all text-center select-none"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED ADVENTURES ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Adventures</h2>
            <p className="text-gray-500 mt-2">Handpicked highlights you&apos;ll love</p>
          </div>

          {featuredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <div
                  key={tour._id || tour.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  {/* Card Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={tour.pictureUrls?.[0] || "/tour1.jpg"}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                      <FaMapMarkerAlt className="text-primary shrink-0" />
                      <span className="truncate">{tour.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <FaClock className="text-primary shrink-0" />
                      <span>{getDurationLabel(tour.availableDates)}</span>
                    </div>

                    {/* Private Booking Link (Bug #12 fixed: uses URL search parameters) */}
                    <Link
                      href={`/book?tourId=${tour._id || tour.id}&mode=private`}
                      className="text-primary font-semibold text-sm hover:underline mb-5 block"
                    >
                      Book a Private Tour »
                    </Link>

                    {/* Price and Action Buttons */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div>
                        <span className="text-xs text-gray-400 block">From</span>
                        <span className="text-primary font-extrabold text-xl">
                          ₱{Number(tour.joinerPrice).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400"> / pax</span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/tours/details/${tour._id || tour.id}`}
                          className="px-3 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                        >
                          Book Now
                        </Link>
                        <Link
                          href={`/tours/details/${tour._id || tour.id}`}
                          className="px-3 py-2 text-xs font-bold border border-primary text-primary rounded-lg hover:bg-brand-light transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No featured tours found.
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How TravelKo Works</h2>
            <p className="text-gray-500 mt-2">Your adventure is just four simple steps away</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:translate-y-[-4px] transition-transform">
              <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10 select-none">01</div>
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FaSearch />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Browse Adventures</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Explore our curated collection of tours, destinations, and activities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:translate-y-[-4px] transition-transform">
              <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10 select-none">02</div>
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FaHeart />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Choose Experience</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Select the perfect tour matching your schedule and interest.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:translate-y-[-4px] transition-transform">
              <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10 select-none">03</div>
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FaShieldAlt />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Secure Booking</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Complete your details and finalize through our secure system.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group hover:translate-y-[-4px] transition-transform">
              <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10 select-none">04</div>
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FaMapMarkedAlt />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Start Journey</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive instant confirmation details and join your trip safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COUNTER/STATS ===== */}
      <section className="bg-primary py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="block text-3xl md:text-4xl font-extrabold mb-1">2,500+</span>
              <span className="text-primary-foreground text-sm opacity-90 font-medium">Happy Travelers</span>
            </div>
            <div>
              <span className="block text-3xl md:text-4xl font-extrabold mb-1">150+</span>
              <span className="text-primary-foreground text-sm opacity-90 font-medium">Tour Packages</span>
            </div>
            <div>
              <span className="block text-3xl md:text-4xl font-extrabold mb-1">50+</span>
              <span className="text-primary-foreground text-sm opacity-90 font-medium">Expert Coordinators</span>
            </div>
            <div>
              <span className="block text-3xl md:text-4xl font-extrabold mb-1 flex justify-center items-center gap-1">
                4.9 <FaStar className="text-yellow-300 text-2xl" />
              </span>
              <span className="text-primary-foreground text-sm opacity-90 font-medium">Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ADVENTURE CATEGORIES (Bug #12 fixed: uses client navigation links) ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Adventure Categories</h2>
            <p className="text-gray-500 mt-2">Choose from our diverse range of adventures</p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/tours?category=${cat.name}`}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-50">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 text-center mt-auto">
                    <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
                    <p className="text-gray-400 text-xs mb-3">
                      {cat.count} Tour{cat.count > 1 ? "s" : ""}
                    </p>
                    <span className="inline-block px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition-colors">
                      View Tours
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No categories found.
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS SLIDER ===== */}
      <TestimonialsCarousel />

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose <span className="font-brand text-primary font-normal">TravelKo?</span>
            </h2>
            <p className="text-gray-500 mt-2">We&apos;re committed to providing the best adventure experiences</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Feat 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <FaCheckCircle className="text-primary text-3xl mb-3" />
              <h5 className="font-bold text-gray-800 text-sm mb-2">Verified Host</h5>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Travel safely knowing coordinators are vetted and verified.
              </p>
            </div>
            {/* Feat 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <FaCreditCard className="text-primary text-3xl mb-3" />
              <h5 className="font-bold text-gray-800 text-sm mb-2">Secure Pay</h5>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Payments are securely managed for risk-free reservation.
              </p>
            </div>
            {/* Feat 3 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <FaClock className="text-primary text-3xl mb-3" />
              <h5 className="font-bold text-gray-800 text-sm mb-2">24/7 Support</h5>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Our support team is always online to help with your bookings.
              </p>
            </div>
            {/* Feat 4 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <FaMoneyBillWave className="text-primary text-3xl mb-3" />
              <h5 className="font-bold text-gray-800 text-sm mb-2">Best Prices</h5>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Competitive transparent rates with no hidden fees.
              </p>
            </div>
            {/* Feat 5 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <FaTrophy className="text-primary text-3xl mb-3" />
              <h5 className="font-bold text-gray-800 text-sm mb-2">Quality Tour</h5>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Tour experiences are strictly monitored to ensure excellence.
              </p>
            </div>
            {/* Feat 6 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <FaMobileAlt className="text-primary text-3xl mb-3" />
              <h5 className="font-bold text-gray-800 text-sm mb-2">Easy Reservation</h5>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Book instantly anywhere from any device in clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="py-16 bg-white border-t border-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Join thousands of travelers who discover new places with TravelKo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tours"
              className="px-8 py-3 rounded-full bg-primary hover:bg-brand-dark text-white font-bold transition-colors shadow-md"
            >
              Browse Tours
            </Link>
            <Link
              href="/coordinator/register"
              className="px-8 py-3 rounded-full border border-primary text-primary hover:bg-brand-light font-bold transition-colors"
            >
              Become a Coordinator
            </Link>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER SECTION ===== */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-3">Stay Updated</h2>
          <p className="text-primary-foreground opacity-90 mb-8 text-sm">
            Get the latest adventure deals and travel tips delivered straight to your inbox.
          </p>

          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-3">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3 rounded-full bg-white text-gray-900 border-0 focus:ring-2 focus:ring-brand-dark focus:outline-none placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-white text-primary font-bold hover:bg-gray-100 transition-colors shadow-sm text-sm cursor-pointer"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-primary-foreground/75">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>
    </div>
  );
}
