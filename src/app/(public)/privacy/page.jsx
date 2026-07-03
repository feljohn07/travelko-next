"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaShieldAlt,
  FaEye,
  FaLock,
  FaUserShield,
  FaEnvelope,
  FaPrint
} from "react-icons/fa";

const SECTIONS = [
  { id: "introduction", title: "1. Introduction", icon: FaShieldAlt },
  { id: "information-collection", title: "2. Information We Collect", icon: FaEye },
  { id: "information-usage", title: "3. How We Use Information", icon: FaLock },
  { id: "information-sharing", title: "4. Information Sharing", icon: FaUserShield },
  { id: "data-security", title: "5. Data Security & Storage", icon: FaShieldAlt },
  { id: "user-rights", title: "6. Your Rights & Choices", icon: FaUserShield },
  { id: "cookies", title: "7. Cookies & Tracking", icon: FaEye },
  { id: "updates", title: "8. Updates to this Policy", icon: FaLock },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

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
              Legal & Trust
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4">
              Privacy Policy
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed mb-6">
              At TravelKo, we care deeply about your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.
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
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaShieldAlt size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">1. Introduction</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    Welcome to TravelKo (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We operate the TravelKo adventure travel booking platform. We respect the privacy of our users (&quot;you&quot; or &quot;your&quot;) and are dedicated to protecting it through compliance with this Privacy Policy.
                  </p>
                  <p>
                    This policy describes the types of information we may collect from you or that you may provide when you visit our website or use our services, and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                  </p>
                  <div className="p-4 bg-emerald-50 rounded-2xl border-l-4 border-primary text-emerald-800 text-xs font-semibold leading-relaxed">
                    By accessing or using our services, you agree to this Privacy Policy. If you do not agree with our policies and practices, please do not use our platform.
                  </div>
                </div>
              </section>

              {/* Information Collection */}
              <section id="information-collection" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaEye size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">2. Information We Collect</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    We collect several types of information from and about users of our platform, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li>
                      <strong>Personal Identifiers:</strong> Name, email address, phone number, physical address, and payment information.
                    </li>
                    <li>
                      <strong>Identity Verification Data:</strong> For coordinators, we collect government-issued IDs, facial scans/selfies (including face-liveness check results) to maintain trust and safety on the platform.
                    </li>
                    <li>
                      <strong>Account Credentials:</strong> Username, password, and authentication tokens.
                    </li>
                    <li>
                      <strong>Usage and Technical Data:</strong> IP address, browser type, operating system, geolocation (if authorized), and navigation history on our platform.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Information Usage */}
              <section id="information-usage" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaLock size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">3. How We Use Information</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    We use information that we collect about you or that you provide to us:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li>To present our website and its contents to you.</li>
                    <li>To process tour booking requests and handle billing.</li>
                    <li>To verify coordinator identity and ensure compliance with security protocols.</li>
                    <li>To notify you about changes to our website, tours, or services.</li>
                    <li>To provide customer support and troubleshoot problems.</li>
                    <li>To improve our user experience, perform analytics, and detect fraud.</li>
                  </ul>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaUserShield size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">4. Information Sharing</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    We do not sell, rent, or trade your personal information. We may disclose personal information that we collect or you provide:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li>To tour coordinators when you request booking a tour, so they can manage reservations and safety details.</li>
                    <li>To third-party payment processors (e.g. GCash, Maya, credit card networks) to process your financial transactions.</li>
                    <li>To service providers and developers who support our platform operations.</li>
                    <li>To comply with any court order, law, or legal process, including responding to government or regulatory requests.</li>
                  </ul>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaShieldAlt size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">5. Data Security & Storage</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All payment transactions are encrypted using secure sockets layer (SSL) technology.
                  </p>
                  <p>
                    The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our website, you are responsible for keeping this password confidential.
                  </p>
                </div>
              </section>

              {/* User Rights */}
              <section id="user-rights" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaUserShield size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">6. Your Rights & Choices</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    Under applicable data privacy laws, you have specific rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Access & Correction:</strong> You can review and change your personal information by logging into the website and visiting your account profile page.</li>
                    <li><strong>Deletion:</strong> You may request the deletion of your account and personal information. Note that some details may remain stored to comply with legal, financial, or regulatory obligations.</li>
                    <li><strong>Opt-Out:</strong> You can opt-out of promotional email distributions at any time using the &apos;unsubscribe&apos; link.</li>
                  </ul>
                </div>
              </section>

              {/* Cookies */}
              <section id="cookies" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaEye size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">7. Cookies & Tracking</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.
                  </p>
                  <p>
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
                  </p>
                </div>
              </section>

              {/* Updates */}
              <section id="updates" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-2">
                  <FaLock size={20} />
                  <h2 className="text-xl font-extrabold text-gray-900">8. Updates to this Policy</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top.
                  </p>
                  <p>
                    You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                  </p>
                </div>
              </section>

            </div>

            {/* Support Callout Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-100/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-base">Have privacy concerns or questions?</h4>
                <p className="text-gray-500 text-xs font-medium max-w-md">
                  Our dedicated trust and safety team is here to assist. Contact us via email for any data requests or deletion inquiries.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
                <Link
                  href="mailto:privacy@travelkoph.com"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-brand-dark text-white text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                >
                  <FaEnvelope size={14} /> Email Privacy Team
                </Link>
              </div>
            </div>

          </article>

        </div>
      </div>
    </div>
  );
}
