"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaEnvelope, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/coordinator/forgot-password", {
        email: email.trim(),
      });

      setSuccessOpen(true);
      toast.success("Password reset email sent! ✉️");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send password reset email.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand logo */}
        <div className="text-center mb-6">
          <Link href="/" className="font-brand text-4xl text-primary font-normal">
            TravelKo
          </Link>
        </div>

        {/* Card Header Banner */}
        <div className="bg-primary text-white p-6 rounded-t-2xl shadow-sm text-center">
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-2 animate-pulse">
            <FaEnvelope size={20} />
          </div>
          <h2 className="font-extrabold text-2xl">Forgot Password</h2>
          <p className="text-primary-foreground opacity-90 text-sm mt-1">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {/* Card Body */}
        <Card className="rounded-b-2xl border-t-0 border-gray-100 shadow-sm">
          <CardContent className="p-6 md:p-8 bg-white">
            {error && (
              <div className="bg-red-50 text-red-650 border border-red-100 rounded-xl p-3 text-xs mb-5 font-semibold text-center">
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your registered email"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-sm font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md cursor-pointer select-none disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending reset link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                <FaArrowLeft size={10} className="text-gray-400" />
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Back to Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ===== SUCCESS DIALOG ===== */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md p-6 flex flex-col items-center text-center">
          <FaCheckCircle size={70} className="text-primary animate-bounce mb-3" />
          <h4 className="font-bold text-lg text-gray-900 mb-1">Check your email!</h4>
          <p className="text-gray-500 text-xs mb-4 leading-relaxed">
            We have sent a secure, time-limited password reset link to <strong className="text-gray-800">{email}</strong>. Please check your inbox and spam folder.
          </p>
          <Button
            onClick={() => setSuccessOpen(false)}
            className="w-full py-2 text-xs font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-sm cursor-pointer select-none"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
