"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaUserCog, FaCheckCircle } from "react-icons/fa";

export default function CoordinatorRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    gender: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const validatePassword = (pwd, confirmPwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("Min 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("1 uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("1 number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd))
      errors.push("1 special character");
    if (pwd !== confirmPwd) errors.push("Passwords do not match");

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validatePassword(form.password, form.confirmPassword);
    if (errors.length) {
      setPasswordError(errors.join(", "));
      return;
    }

    setLoading(true);
    setPasswordError("");

    try {
      await api.post("auth/coordinator", {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        gender: form.gender,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });

      setSuccessOpen(true);

      setTimeout(() => {
        setSuccessOpen(false);
        router.replace("/login");
      }, 2000);
    } catch (error) {
      setPasswordError(
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Banner Header */}
        <div className="bg-primary text-white p-6 rounded-t-2xl shadow-sm">
          <h2 className="font-extrabold text-2xl">Coordinator Registration</h2>
          <p className="text-primary-foreground opacity-90 text-sm mt-1">
            Create your coordinator account to start listing tour packages
          </p>
        </div>

        {/* Form Card Content */}
        <Card className="rounded-b-2xl border-t-0 border-gray-100 shadow-sm">
          <CardContent className="p-6 md:p-8 bg-white">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Username *
                </label>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter a unique username"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter email address"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-gray-700"
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Contact Number *
                </label>
                <input
                  name="phoneNumber"
                  type="text"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="+63 900 000 0000"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Create secure password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    handleChange(e);
                    const errors = validatePassword(form.password, e.target.value);
                    setPasswordError(errors.join(", "));
                  }}
                  required
                  disabled={loading}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
                {passwordError && (
                  <span className="text-red-550 font-semibold text-xs block mt-1.5">
                    ⚠ {passwordError}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-sm font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md cursor-pointer select-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaUserCog /> Register as Coordinator
                    </span>
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 mt-4">
                Already have a coordinator account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Log in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ===== SUCCESS DIALOG ===== */}
      <Dialog open={successOpen} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md p-6 flex flex-col items-center text-center">
          <FaCheckCircle size={70} className="text-primary animate-bounce mb-3" />
          <h4 className="font-bold text-lg text-gray-900 mb-1">Registration Successful!</h4>
          <p className="text-gray-450 text-xs mb-3">
            Your coordinator account has been created successfully.
          </p>
          <span className="text-[10px] text-gray-400 font-semibold">Redirecting to login page...</span>
        </DialogContent>
      </Dialog>
    </div>
  );
}
