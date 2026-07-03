"use client";

import { useState } from "react";
import {
  FaMapMarkerAlt,
  FaBullseye,
  FaShieldAlt,
  FaRibbon,
  FaCreditCard,
  FaGlobe,
  FaUmbrella,
  FaBriefcase,
  FaCar,
  FaUsers,
} from "react-icons/fa";

const missionVisionData = [
  {
    title: "Our Mission",
    icon: <FaBullseye />,
    points: [
      "To democratize adventure travel by connecting passionate travelers with trusted local coordinators, providing seamless booking experiences, and offering premium travel equipment - all while ensuring the highest standards of safety and customer satisfaction.",
      "Enable accessible adventure experiences for all travelers",
      "Support local tourism coordinators and communities",
      "Promote sustainable and responsible tourism practices",
    ],
  },
  {
    title: "Our Vision",
    icon: <FaBullseye />,
    points: [
      "To become Southeast Asia's leading adventure travel ecosystem, where every journey is safe, memorable, and transformative. We envision a world where adventure travel is accessible, sustainable, and enriching for both travelers and local communities.",
      "Pioneer innovative travel technology solutions",
      "Expand to serve the entire Southeast Asian market",
      "Create positive economic impact in rural communities",
    ],
  },
];

const coreValuesData = [
  {
    title: "Safety First",
    description:
      "We prioritize the safety of our travelers and coordinators in every adventure.",
    icon: <FaShieldAlt />,
  },
  {
    title: "Authenticity",
    description:
      "We ensure genuine and memorable experiences that reflect local culture and traditions.",
    icon: <FaShieldAlt />,
  },
  {
    title: "Sustainability",
    description:
      "We promote responsible tourism that protects the environment and supports local communities.",
    icon: <FaShieldAlt />,
  },
  {
    title: "Excellence",
    description:
      "We strive to provide the highest quality service and exceptional adventure experiences.",
    icon: <FaShieldAlt />,
  },
];

const certifications = [
  {
    name: "Department of Tourism (DOT)",
    description:
      "License No: DOT-2024-TK-001234 Authorized travel agency license for domestic and international tour operations, valid until December 2025.",
    icon: <FaRibbon className="text-white" size={24} />,
    bg: "bg-primary",
  },
  {
    name: "Bureau of Internal Revenue (BIR)",
    description:
      "TIN: 123-456-789-000 Registered business entity authorized to collect taxes and issue official receipts for tourism services.",
    icon: <FaCreditCard className="text-white" size={20} />,
    bg: "bg-primary",
  },
  {
    name: "Securities and Exchange Commission (SEC)",
    description:
      "Registration No: CS202400987654 Corporate registration as TravelKo Travel Services Corporation, authorized to operate nationwide.",
    icon: <FaGlobe className="text-white" size={20} />,
    bg: "bg-primary",
  },
];

const accreditations = [
  {
    name: "Philippine Travel Agencies Association (PTAA)",
    description:
      "Member ID: PTAA-2024-001856. Active member of the national association ensuring ethical business practices and professional standards.",
    icon: <FaRibbon className="text-white" size={22} />,
    bg: "bg-primary",
  },
  {
    name: "Payment Card Industry (PCI DSS)",
    description:
      "Compliance Level: PCI DSS Level 1. Certified secure payment processing system protecting customer financial information and transactions.",
    icon: <FaCreditCard className="text-white" size={22} />,
    bg: "bg-primary",
  },
  {
    name: "International Air Transport Association (IATA)",
    description:
      "Agent Code: 12345678. Authorized to issue airline tickets and provide flight booking services for international travel.",
    icon: <FaGlobe className="text-white" size={22} />,
    bg: "bg-primary",
  },
];

const insuranceData = [
  {
    title: "Travel Insurance",
    description:
      "Coverage for medical emergencies, trip cancellations, delays, and unforeseen incidents to protect travelers throughout their journey.",
    icon: <FaUmbrella />,
  },
  {
    title: "Business Liability Insurance",
    description:
      "Protects TravelKo against legal liabilities, property damage, and third-party claims arising from business operations.",
    icon: <FaBriefcase />,
  },
  {
    title: "Vehicle Fleet Insurance",
    description:
      "Comprehensive insurance coverage for company-operated and partner vehicles used in tours, transfers, and logistics.",
    icon: <FaCar />,
  },
];

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [activeIndexInsurance, setActiveIndexInsurance] = useState(0);

  const nextInsurance = () => {
    setActiveIndexInsurance((prev) =>
      prev === insuranceData.length - 1 ? 0 : prev + 1
    );
  };

  const previousInsurance = () => {
    setActiveIndexInsurance((prev) =>
      prev === 0 ? insuranceData.length - 1 : prev - 1
    );
  };

  const next = () =>
    setActiveIndex((prev) => (prev + 1) % missionVisionData.length);
  const previous = () =>
    setActiveIndex((prev) =>
      prev === 0 ? missionVisionData.length - 1 : prev - 1
    );

  const next2 = () =>
    setActiveIndex2((prev) => (prev + 1) % coreValuesData.length);
  const previous2 = () =>
    setActiveIndex2((prev) =>
      prev === 0 ? coreValuesData.length - 1 : prev - 1
    );

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('/landingPage.png')` }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 z-1" />

        {/* Content */}
        <div className="relative z-2 text-center text-white max-w-3xl px-4">
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
            About <br />
            <span className="font-brand text-primary font-normal">TravelKo</span>
          </h1>
          <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Connecting adventurers with experienced coordinators to create unforgettable travel experiences. Your trusted partner for adventure tours and premium travel gear.
          </p>
        </div>
      </section>

      {/* ===== ABOUT DETAILS & STATS ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About TravelKo</h2>
            <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed text-sm md:text-base mb-6">
              TravelKo is the Philippines&apos; premier platform designed to bring together passionate travelers and experienced travel coordinators in one central location. We revolutionize how adventure enthusiasts discover, plan, and experience their dream journeys.
            </p>
            <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed text-sm md:text-base">
              Founded with the vision of making adventure travel accessible to everyone, TravelKo provides a comprehensive ecosystem that includes tour booking, travel gear shopping, and secure payment solutions. We bridge the gap between wanderlust and reality.
            </p>
          </div>

          {/* Stats with icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center mt-12">
            {/* Stat 1 */}
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl mb-4 shadow-sm">
                <FaMapMarkerAlt />
              </div>
              <h4 className="font-extrabold text-xl text-gray-900 mb-1">200+ Destinations</h4>
              <p className="text-gray-500 text-sm">Across the Philippines</p>
            </div>

            {/* Stat 2 */}
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl mb-4 shadow-sm">
                <FaUsers />
              </div>
              <h4 className="font-extrabold text-xl text-gray-900 mb-1">500+ Coordinators</h4>
              <p className="text-gray-500 text-sm">Verified travel experts</p>
            </div>

            {/* Stat 3 - Image banner */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-sm group">
              <img
                src="/traveler.jpg"
                alt="Happy Followers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-4 left-4 bg-primary text-white py-2.5 px-4 rounded-xl font-bold shadow-md z-10 text-center leading-tight text-sm">
                10,000+ <br />
                <span className="text-[11px] opacity-90 font-medium">Happy Followers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Mission & Vision</h2>
            <p className="max-w-xl mx-auto text-gray-500 text-sm">
              Driving the future of adventure travel through innovation, safety, and exceptional experiences.
            </p>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col items-center">
            {/* Card Content */}
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px] flex flex-col">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl mb-4 shadow-sm shrink-0">
                {missionVisionData[activeIndex].icon}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4">
                {missionVisionData[activeIndex].title}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
                {missionVisionData[activeIndex].points.map((point, idx) => (
                  <li key={idx} className="list-item">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Nav Controls */}
            <div className="flex justify-between w-full max-w-sm mt-4 gap-4">
              <button
                onClick={previous}
                className="flex-1 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                onClick={next}
                className="flex-1 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-6">
              {missionVisionData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeIndex === index ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Core Values</h2>
            <p className="max-w-xl mx-auto text-gray-500 text-sm">
              The principles that guide every adventure and decision at TravelKo.
            </p>
          </div>

          <div className="max-w-xl mx-auto flex flex-col items-center">
            {/* Card Content */}
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center min-h-[220px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl mb-4 shadow-sm">
                {coreValuesData[activeIndex2].icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                {coreValuesData[activeIndex2].title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                {coreValuesData[activeIndex2].description}
              </p>
            </div>

            {/* Nav Controls */}
            <div className="flex justify-between w-full max-w-[280px] mt-4 gap-4">
              <button
                onClick={previous2}
                className="flex-1 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                onClick={next2}
                className="flex-1 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-6">
              {coreValuesData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex2(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeIndex2 === index ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PERMITS & CERTIFICATIONS ===== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Permits & Licenses</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              TravelKo operates under full legal compliance with all Philippine tourism and business regulations, ensuring safe and legitimate travel services for our customers.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            {/* Government Certs */}
            <div>
              <h4 className="font-extrabold text-lg text-gray-950 mb-4 text-center sm:text-left">
                Government Certifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                        {cert.icon}
                      </div>
                      <div>
                        <h6 className="font-bold text-gray-900 text-sm mb-1">{cert.name}</h6>
                        <p className="text-gray-500 text-[11px] leading-relaxed">{cert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Accreditations */}
            <div>
              <h4 className="font-extrabold text-lg text-gray-950 mb-4 text-center sm:text-left">
                Industry Accreditations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accreditations.map((cert, idx) => (
                  <div key={idx} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                        {cert.icon}
                      </div>
                      <div>
                        <h6 className="font-bold text-gray-900 text-sm mb-1">{cert.name}</h6>
                        <p className="text-gray-500 text-[11px] leading-relaxed">{cert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INSURANCE COVERAGE ===== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Insurance Coverage</h2>
            <p className="max-w-xl mx-auto text-gray-500 text-sm">
              Comprehensive insurance protection to ensure safety, reliability, and peace of mind.
            </p>
          </div>

          <div className="max-w-xl mx-auto flex flex-col items-center">
            {/* Card Content */}
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center min-h-[220px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl mb-4 shadow-sm">
                {insuranceData[activeIndexInsurance].icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                {insuranceData[activeIndexInsurance].title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {insuranceData[activeIndexInsurance].description}
              </p>
            </div>

            {/* Nav Controls */}
            <div className="flex justify-between w-full max-w-[280px] mt-4 gap-4">
              <button
                onClick={previousInsurance}
                className="flex-1 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                onClick={nextInsurance}
                className="flex-1 py-2 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-6">
              {insuranceData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndexInsurance(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeIndexInsurance === index ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12 max-w-xl mx-auto">
            <p className="text-gray-400 text-xs leading-relaxed">
              All permits and licenses are regularly renewed and updated. For verification of any certification, please contact our customer service team.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
