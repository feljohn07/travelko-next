"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUserClock, FaEnvelope, FaPhone, FaVenusMars, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function CoordinatorApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/admin/for-approval-coordinators");
      setApplications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch coordinator applications:", err);
      toast.error("Failed to load applications list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchApplications();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token]);

  const handleApprove = async (id) => {
    const toastId = toast.loading("Approving coordinator...");
    try {
      await api.patch(`/auth/admin/approve-coordinator/${id}`, {});
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.update(toastId, {
        render: "🎉 Coordinator approved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: `❌ Approval failed: ${err.response?.data?.message || "Error"}`,
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    }
  };

  const handleDecline = async (id) => {
    const toastId = toast.loading("Declining application...");
    try {
      await api.get(`/auth/admin/decline-coordinator/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.update(toastId, {
        render: "🗑️ Application declined.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: `❌ Rejection failed: ${err.response?.data?.message || "Error"}`,
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-gray-150">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Coordinator Applications
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">Approve or reject pending coordinator onboarding applications</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <FaUserClock size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-400 font-semibold text-sm">No pending applications at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((a) => (
            <Card key={a.id} className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden p-5 md:p-6">
              <CardContent className="p-0 flex flex-col md:flex-row gap-5 items-start">
                {/* Profile Picture */}
                <div className="shrink-0">
                  {a.profileImageUrl ? (
                    <img
                      src={a.profileImageUrl}
                      alt="Profile"
                      className="rounded-full object-cover border border-gray-100 shadow-sm w-20 h-20"
                    />
                  ) : (
                    <div className="rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-2xl w-20 h-20">
                      {(a.fullName || a.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Details Content */}
                <div className="grow space-y-3 w-full">
                  <h4 className="font-extrabold text-gray-900 text-lg">{a.fullName || a.name}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-600 leading-relaxed">
                    <p className="flex items-center gap-1.5">
                      <FaEnvelope className="text-gray-400" />
                      <strong className="text-gray-800">Email:</strong> {a.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaPhone className="text-gray-400" />
                      <strong className="text-gray-800">Phone:</strong> {a.phoneNumber || a.phone || "—"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaVenusMars className="text-gray-400" />
                      <strong className="text-gray-800">Gender:</strong> {a.gender || "—"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <strong className="text-gray-800">Address:</strong> {a.address || "—"}
                    </p>
                  </div>

                  {/* ID Attachment Uploads */}
                  {a.idImageUrl && (
                    <div className="pt-2">
                      <span className="font-bold text-gray-700 text-xs flex items-center gap-1 mb-2">
                        <FaFileAlt className="text-primary" /> Submitted Identification Card(s):
                      </span>
                      <div className="flex gap-3 flex-wrap">
                        {Array.isArray(a.idImageUrl) ? (
                          a.idImageUrl.map((url, idx) => (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              key={idx}
                              className="block relative rounded-xl border border-gray-200 overflow-hidden hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={url}
                                alt={`ID Attachment ${idx + 1}`}
                                className="h-16 w-28 object-cover bg-gray-50"
                              />
                            </a>
                          ))
                        ) : typeof a.idImageUrl === "string" && a.idImageUrl.trim() !== "" ? (
                          <a
                            href={a.idImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative rounded-xl border border-gray-200 overflow-hidden hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={a.idImageUrl}
                              alt="ID Attachment"
                              className="h-16 w-28 object-cover bg-gray-50"
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">No ID uploaded</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-3 border-t border-gray-50 mt-3">
                    <Button
                      onClick={() => handleApprove(a.id)}
                      className="px-4 py-2 bg-primary hover:bg-brand-dark text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleDecline(a.id)}
                      variant="destructive"
                      className="px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
