"use client";

import { useState } from "react";
import {
  FaCoins,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaUsers,
  FaDownload,
  FaSearch,
  FaArrowUp,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";

// Mock Data for the 4 core accounting components
const MOCK_SALES_REPORT = [
  { id: 1, tourName: "El Nido Island Hopping Tour A", category: "Island", salesCount: 45, grossAmount: 157500, coordinator: "Juan Dela Cruz" },
  { id: 2, tourName: "Mt. Pinatubo Day Hike", category: "Hiking", salesCount: 82, grossAmount: 205000, coordinator: "Maria Santos" },
  { id: 3, tourName: "Bohol Countryside Tour with Loboc Cruise", category: "Tours", salesCount: 29, grossAmount: 116000, coordinator: "Juan Dela Cruz" },
  { id: 4, tourName: "Mt. Pulag Playground Hike", category: "Mountain", salesCount: 54, grossAmount: 243000, coordinator: "Roberto Reyes" },
  { id: 5, tourName: "Boracay Parasailing & Water Activities", category: "Island", salesCount: 112, grossAmount: 392000, coordinator: "Sitti Amina" },
  { id: 6, tourName: "Coron Ultimate Tour", category: "Island", grossAmount: 171000, salesCount: 38, coordinator: "Maria Santos" },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN-9843", refNo: "BK-1784373696244", customer: "Feljohn M.", amount: 3500, method: "GCash", status: "Success", date: "2026-07-18" },
  { id: "TXN-9842", refNo: "BK-1784372911293", customer: "John Doe", amount: 5000, method: "Bank Transfer", status: "Success", date: "2026-07-17" },
  { id: "TXN-9841", refNo: "BK-1784371844212", customer: "Jane Smith", amount: 2500, method: "GCash", status: "Success", date: "2026-07-17" },
  { id: "TXN-9840", refNo: "BK-1784370211345", customer: "Mark Lee", amount: 12000, method: "Bank Transfer", status: "Pending", date: "2026-07-16" },
  { id: "TXN-9839", refNo: "BK-1784369400234", customer: "Sarah Connor", amount: 4500, method: "GCash", status: "Success", date: "2026-07-15" },
  { id: "TXN-9838", refNo: "BK-1784368112093", customer: "Bruce Wayne", amount: 15000, method: "Bank Transfer", status: "Failed", date: "2026-07-14" },
];

const MOCK_REVENUE_REPORT = [
  { month: "July 2026", grossBookings: 640000, serviceFeeRate: "10%", serviceFeeCollected: 64000, coordinatorPayout: 576000, status: "In Progress" },
  { month: "June 2026", grossBookings: 1250000, serviceFeeRate: "10%", serviceFeeCollected: 125000, coordinatorPayout: 1125000, status: "Settled" },
  { month: "May 2026", grossBookings: 980000, serviceFeeRate: "10%", serviceFeeCollected: 98000, coordinatorPayout: 882000, status: "Settled" },
  { month: "April 2026", grossBookings: 850000, serviceFeeRate: "10%", serviceFeeCollected: 85000, coordinatorPayout: 765000, status: "Settled" },
  { month: "March 2026", grossBookings: 720000, serviceFeeRate: "10%", serviceFeeCollected: 72000, coordinatorPayout: 648000, status: "Settled" },
];

const MOCK_BOOKING_SUMMARY = [
  { refNo: "BK-1784373696244", tour: "El Nido Island Hopping Tour A", coordinator: "Juan Dela Cruz", pax: 1, type: "Private", amount: 3500, date: "2026-07-18", status: "Confirmed" },
  { refNo: "BK-1784372911293", tour: "Mt. Pinatubo Day Hike", coordinator: "Maria Santos", pax: 2, type: "Joiner", amount: 5000, date: "2026-07-17", status: "Confirmed" },
  { refNo: "BK-1784371844212", tour: "Bohol Countryside Tour with Loboc Cruise", coordinator: "Juan Dela Cruz", pax: 1, type: "Joiner", amount: 2500, date: "2026-07-17", status: "Pending" },
  { refNo: "BK-1784370211345", tour: "Mt. Pulag Playground Hike", coordinator: "Roberto Reyes", pax: 4, type: "Private", amount: 12000, date: "2026-07-16", status: "Pending" },
  { refNo: "BK-1784369400234", tour: "Boracay Parasailing & Water Activities", coordinator: "Sitti Amina", pax: 3, type: "Joiner", amount: 4500, date: "2026-07-15", status: "Completed" },
  { refNo: "BK-1784368112093", tour: "Coron Ultimate Tour", coordinator: "Maria Santos", pax: 5, type: "Joiner", amount: 15000, date: "2026-07-14", status: "Cancelled" },
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [searchTerm, setSearchTerm] = useState("");

  const handleExport = (reportType) => {
    toast.success(`Exporting ${reportType} as CSV... 📊`);
  };

  // Filter lists based on search term
  const filteredSales = MOCK_SALES_REPORT.filter((item) =>
    item.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.coordinator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = MOCK_TRANSACTIONS.filter((item) =>
    item.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRevenue = MOCK_REVENUE_REPORT.filter((item) =>
    item.month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = MOCK_BOOKING_SUMMARY.filter((item) =>
    item.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tour.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.coordinator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Computerized Accounting System
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Real-time financial audits, transaction logs, sales metrics, and platform revenue breakdowns.
          </p>
        </div>
        <button
          onClick={() => handleExport(activeTab.toUpperCase())}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer select-none"
        >
          <FaDownload size={12} />
          Export {activeTab.toUpperCase()}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:scale-[1.01] transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Gross Sales</span>
            <h3 className="text-2xl font-black">₱1,284,500</h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full w-fit">
              <FaArrowUp size={8} /> +12.4% this month
            </span>
          </div>
          <div className="bg-white/20 p-3.5 rounded-2xl">
            <FaCoins size={22} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:scale-[1.01] transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Revenue (10% Fee)</span>
            <h3 className="text-2xl font-black">₱128,450</h3>
            <span className="text-[10px] opacity-85 block">Admin earnings accumulated</span>
          </div>
          <div className="bg-white/20 p-3.5 rounded-2xl">
            <FaFileInvoiceDollar size={22} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:scale-[1.01] transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Total Bookings</span>
            <h3 className="text-2xl font-black">342 Requests</h3>
            <span className="text-[10px] opacity-85 block">Across all active destinations</span>
          </div>
          <div className="bg-white/20 p-3.5 rounded-2xl">
            <FaCalendarCheck size={22} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:scale-[1.01] transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Coordinators</span>
            <h3 className="text-2xl font-black">18 Registered</h3>
            <span className="text-[10px] opacity-85 block">Verified local guides</span>
          </div>
          <div className="bg-white/20 p-3.5 rounded-2xl">
            <FaUsers size={22} />
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Navigation & Search row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-4 mb-4">
          <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab("sales"); setSearchTerm(""); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "sales"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sales Report
            </button>
            <button
              onClick={() => { setActiveTab("transactions"); setSearchTerm(""); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "transactions"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Transaction History
            </button>
            <button
              onClick={() => { setActiveTab("revenue"); setSearchTerm(""); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "revenue"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Revenue Report (Service Fee)
            </button>
            <button
              onClick={() => { setActiveTab("bookings"); setSearchTerm(""); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "bookings"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Booking Summary Report
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder={`Search ${activeTab === "sales" ? "tours..." : activeTab === "transactions" ? "transactions..." : activeTab === "revenue" ? "months..." : "bookings..."}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder-gray-400"
            />
            <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Tab 1 Content: Sales Report */}
        {activeTab === "sales" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-gray-450 font-bold">
                  <th className="py-3 px-4">Tour Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Tours Sold</th>
                  <th className="py-3 px-4">Coordinator</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredSales.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs truncate">{item.tourName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-brand-light text-primary rounded-lg text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">{item.salesCount}</td>
                    <td className="py-3.5 px-4">{item.coordinator}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">₱{item.grossAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">No tours found matching "{searchTerm}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2 Content: Transaction History */}
        {activeTab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-gray-450 font-bold">
                  <th className="py-3 px-4">TXN ID</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{item.id}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{item.refNo}</td>
                    <td className="py-3.5 px-4 font-semibold">{item.customer}</td>
                    <td className="py-3.5 px-4">{item.method}</td>
                    <td className="py-3.5 px-4">{item.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === "Success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">₱{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">No transactions found matching "{searchTerm}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3 Content: Revenue Report */}
        {activeTab === "revenue" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-gray-450 font-bold">
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4 text-right">Gross Bookings</th>
                  <th className="py-3 px-4 text-center">Service Fee %</th>
                  <th className="py-3 px-4 text-right">Revenue (Platform Fee)</th>
                  <th className="py-3 px-4 text-right">Coordinator Payouts (90%)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredRevenue.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{item.month}</td>
                    <td className="py-3.5 px-4 text-right">₱{item.grossBookings.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">{item.serviceFeeRate}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">₱{item.serviceFeeCollected.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-gray-600">₱{item.coordinatorPayout.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === "Settled"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRevenue.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">No records found matching "{searchTerm}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4 Content: Booking Summary Report */}
        {activeTab === "bookings" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-gray-450 font-bold">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Adventure Title</th>
                  <th className="py-3 px-4">Coordinator</th>
                  <th className="py-3 px-4 text-center">Pax</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredBookings.map((item) => (
                  <tr key={item.refNo} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-gray-500">{item.refNo}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs truncate">{item.tour}</td>
                    <td className="py-3.5 px-4 font-semibold">{item.coordinator}</td>
                    <td className="py-3.5 px-4 text-center">{item.pax}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        item.type === "Private"
                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                          : "bg-teal-50 text-teal-700 border border-teal-100"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{item.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === "Completed" || item.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">₱{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400">No bookings found matching "{searchTerm}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log / Additional Context */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h5 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
          <FaChevronRight size={10} className="text-emerald-600" />
          System Information
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <strong className="text-gray-700">Database Status:</strong> Connected to TravelKo Production
          </div>
          <div>
            <strong className="text-gray-700">Platform Split Rate:</strong> 90% Coordinator / 10% Service Fee
          </div>
          <div>
            <strong className="text-gray-700">Accounting Protocol:</strong> GAAP Compliant System
          </div>
        </div>
      </div>
    </div>
  );
}
