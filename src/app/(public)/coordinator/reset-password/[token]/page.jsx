"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaEye, FaEyeSlash, FaCheckCircle, FaLock, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

export default function CoordinatorResetPasswordPage({ params }) {
  const router = useRouter();
  
  // React's use() hook is required to unwrap dynamic params in Next.js 15/16
  const { token } = use(params);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  // Criteria definition for validation
  const validationCriteria = [
    { label: "Min 8 characters", met: password.length >= 8 },
    { label: "1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "1 number", met: /[0-9]/.test(password) },
    { label: "1 special character", met: /[!@#$%^&*(),.?\":{}|<>]/.test(password) },
    { label: "Passwords match", met: password.length > 0 && password === confirmPassword },
  ];

  const allCriteriaMet = validationCriteria.every((c) => c.met);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!allCriteriaMet) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`auth/coordinator/reset-password/${token}`, {
        newPassword: password,
      });

      setSuccessOpen(true);
      toast.success("Password reset successfully! 🎉");

      setTimeout(() => {
        setSuccessOpen(false);
        router.replace("/login");
      }, 3000);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to reset password.";
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
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <FaLock size={20} />
          </div>
          <h2 className="font-extrabold text-2xl">Reset Password</h2>
          <p className="text-primary-foreground opacity-90 text-sm mt-1">
            Choose a strong, secure password for your coordinator account
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

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer select-none"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Re-enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer select-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirement Checks */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 block mb-2">
                  PASSWORD REQUIREMENTS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {validationCriteria.map((criterion, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs transition-colors duration-200"
                    >
                      {criterion.met ? (
                        <FaCheck className="text-emerald-500 flex-shrink-0 animate-scale-in" size={10} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0 ml-1 mr-1" />
                      )}
                      <span
                        className={
                          criterion.met
                            ? "text-emerald-600 font-semibold transition-all"
                            : "text-gray-400 font-medium"
                        }
                      >
                        {criterion.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || !allCriteriaMet}
                  className="w-full py-6 text-sm font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving changes...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 mt-2">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Back to Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ===== SUCCESS DIALOG ===== */}
      <Dialog open={successOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md p-6 flex flex-col items-center text-center">
          <FaCheckCircle size={70} className="text-primary animate-bounce mb-3" />
          <h4 className="font-bold text-lg text-gray-900 mb-1">Password Changed!</h4>
          <p className="text-gray-450 text-xs mb-3">
            Your password has been successfully reset. You can now use your new password to sign in.
          </p>
          <span className="text-[10px] text-gray-400 font-semibold">Redirecting to login page...</span>
        </DialogContent>
      </Dialog>
    </div>
  );
}
