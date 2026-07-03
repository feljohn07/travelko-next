"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaHandshake,
  FaFile,
  FaCreditCard,
  FaCalendarTimes,
  FaShieldAlt,
  FaBalanceScale,
  FaEnvelope,
  FaPrint
} from "react-icons/fa";

const SECTIONS = [
  { id: "agreement", title: "1. Agreement to Terms", icon: FaHandshake },
  { id: "eligibility", title: "2. Eligibility & Accounts", icon: FaFile },
  { id: "bookings", title: "3. Bookings & Conduct", icon: FaHandshake },
  { id: "payments", title: "4. Payments & Refunds", icon: FaCreditCard },
  { id: "cancellations", title: "5. Cancellation Policy", icon: FaCalendarTimes },
  { id: "liability", title: "6. Limitation of Liability", icon: FaShieldAlt },
  { id: "governing-law", title: "7. Governing Law", icon: FaBalanceScale },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("agreement");

  const handleScrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-900 text-white py-16 md:py-24">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        {/* Soft Radial Gradient */}
        <div className="absolute inset-0 bg-radial-at-c from-emerald-500/20 via-transparent to-transparent z-0" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-1">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30">
              Legal & Agreement
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4">
              Terms of Service
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed mb-6">
              Please read these terms and conditions carefully before using the TravelKo platform. By using our platform, you agree to comply with these terms.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200 font-medium">
              <span>Last updated: July 2, 2026</span>
              <span className="h-4 w-px bg-emerald-700/60 hidden sm:inline" />
              <span>Version 2.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT SIDEBAR: Table of Contents */}
          <aside className="lg:col-span-4 h-fit sticky top-28 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleScrollTo(sec.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold rounded-xl transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-gray-600 hover:text-primary hover:bg-emerald-50/50 cursor-pointer"
                      }`}
                    >
                      <Icon className={`shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} size={14} />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Utility actions */}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FaPrint size={12} /> Print Document
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Document Content */}
          <article className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">
              
              {/* Agreement */}
              <section id="agreement" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaHandshake size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">1. Agreement to Terms</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and TravelKo (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), concerning your access to and use of our platform and website.
                  </p>
                  <p>
                    By accessing the platform, you acknowledge that you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the platform and must discontinue use immediately.
                  </p>
                </div>
              </section>

              {/* Eligibility */}
              <section id="eligibility" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaFile size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">2. Eligibility & Accounts</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    To register an account or book tours on TravelKo, you must be at least 18 years of age. By creating an account, you represent and warrant that all registration information you submit is truthful, accurate, and current.
                  </p>
                  <p>
                    <strong>Coordinator Accounts:</strong> Users registering as tour coordinators are subject to additional verification. This includes providing valid government identification and completing a face-liveness verification check. We reserve the right to suspend or reject any coordinator account that fails verification.
                  </p>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and are fully responsible for all activities that occur under your account.
                  </p>
                </div>
              </section>

              {/* Bookings */}
              <section id="bookings" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaHandshake size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">3. Bookings & Conduct</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    TravelKo provides a marketplace connecting adventurers with verified tour coordinators. The following booking rules apply:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Accuracy:</strong> You must provide accurate participant details (names, contact information, health declarations) when requested during booking.</li>
                    <li><strong>Health & Safety:</strong> You must meet the physical requirements listed for any outdoor hikes or extreme adventures. Coordinators reserve the right to refuse service to anyone unfit for the physical challenge.</li>
                    <li><strong>Conduct:</strong> You must follow the instructions of the coordinator during the tour. Disruptive, illegal, or unsafe behavior is grounds for immediate termination from the tour without refund.</li>
                  </ul>
                </div>
              </section>

              {/* Payments */}
              <section id="payments" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaCreditCard size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">4. Payments & Refunds</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    All payments made on the TravelKo platform are processed through secure third-party billing providers.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Deposit:</strong> Some tours may require a non-refundable deposit to secure your slot.</li>
                    <li><strong>Full Settlement:</strong> For international or premium tours, full payments must be settled at least <strong>30 days prior</strong> to the departure date.</li>
                    <li><strong>Billing Disputes:</strong> Any disputes regarding charges must be submitted to TravelKo support within 14 days of the transaction.</li>
                  </ul>
                </div>
              </section>

              {/* Cancellations */}
              <section id="cancellations" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaCalendarTimes size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">5. Cancellation & Re-scheduling</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    Cancellation policies are set dynamically by coordinators for each tour and are displayed clearly on the tour details page before booking.
                  </p>
                  <p>
                    <strong>Force Majeure / Weather Cancellations:</strong> If a tour is cancelled by the coordinator due to safety concerns, severe weather conditions, or local government travel bans, participants will be offered a full refund or a free re-scheduling slot.
                  </p>
                  <p>
                    <strong>User Cancellations:</strong> Cancellations initiated by users are subject to the specific refund window specified in the tour listing. Typically, cancellations made less than 7 days prior to departure are non-refundable.
                  </p>
                </div>
              </section>

              {/* Liability */}
              <section id="liability" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaShieldAlt size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">6. Limitation of Liability</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    TravelKo acts as an intermediary platform connecting users and tour coordinators. We are not responsible for the actual execution of the tours, coordinator negligence, participant accidents, loss of belongings, or travel delays.
                  </p>
                  <p>
                    You agree that participation in any outdoor adventure, hiking, or travel package listed on our platform is done at your own risk. To the maximum extent permitted by law, TravelKo is not liable for any direct, indirect, incidental, or consequential damages resulting from your travel.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section id="governing-law" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaBalanceScale size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">7. Governing Law</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    These Terms of Service and your use of our platform are governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law principles.
                  </p>
                  <p>
                    Any legal action or dispute arising out of these terms shall be settled exclusively in the competent courts of the Philippines.
                  </p>
                </div>
              </section>

            </div>

            {/* Support Callout Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-100/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-base">Have legal or compliance questions?</h4>
                <p className="text-gray-500 text-xs font-medium max-w-md">
                  Contact our compliance and legal affairs department if you require further clarification regarding our Terms of Service.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
                <Link
                  href="mailto:support@travelkoph.com"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-brand-dark text-white text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                >
                  <FaEnvelope size={14} /> Contact Support
                </Link>
              </div>
            </div>

          </article>

        </div>
      </div>
    </div>
  );
}
