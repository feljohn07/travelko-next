"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { FaUserTie, FaUserShield } from "react-icons/fa";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login: performContextLogin } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("coordinator");

  useEffect(() => {
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    if (isRemembered) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberMe(true);
      const savedUser = localStorage.getItem("remembered_username");
      if (savedUser) setUsername(savedUser);
      const savedRole = localStorage.getItem("remembered_role");
      if (savedRole) setRole(savedRole);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoggingIn(true);

    try {
      const loginEndpoint =
        role === "admin" ? "auth/admin/login" : "auth/coordinator/login";

      const res = await api.post(loginEndpoint, { username, password });
      const data = res.data;

      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.accessToken;

      if (!token) {
        throw new Error("Login succeeded but token was not returned.");
      }

      const user = data.user || data.admin || data.data?.user;
      const profilePic = data.profilePicture || user?.profilePicture || null;

      // Persist auth through hook
      performContextLogin(token, role, user, profilePic, rememberMe);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("remembered_username", username);
        localStorage.setItem("remembered_role", role);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("remembered_username");
        localStorage.removeItem("remembered_role");
      }

      setTimeout(() => {
        setLoggingIn(false);
        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/coordinator/dashboard");
        }
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong."
      );
      setLoggingIn(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand logo */}
        <div className="text-center mb-6">
          <Link href="/" className="font-brand text-4xl text-primary font-normal">
            TravelKo
          </Link>
        </div>

        {/* Card wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 md:p-8">
          {/* Role selector tab switcher */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setRole("coordinator")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                role === "coordinator"
                  ? "bg-primary border-primary text-white"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FaUserTie size={13} />
              Coordinator
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                role === "admin"
                  ? "bg-gray-800 border-gray-800 text-white"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FaUserShield size={13} />
              Admin
            </button>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Sign in as {role === "admin" ? "Admin" : "Coordinator"}
            </h3>
            {role === "coordinator" && (
              <p className="text-gray-400 text-xs">
                Or{" "}
                <Link
                  href="/coordinator/register"
                  className="text-primary font-bold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-650 border border-red-100 rounded-xl p-3 text-xs mb-5 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
              />
            </div>

            {/* Checkbox & Forgot link */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="rounded text-primary border-gray-300 focus:ring-primary focus:ring-offset-0 focus:outline-none cursor-pointer"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-sm font-bold rounded-xl bg-primary hover:bg-brand-dark cursor-pointer shadow-md select-none mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Legal / Policies footnotes */}
          <div className="mt-6 space-y-2.5 text-[10px] text-gray-400 text-center leading-normal">
            <p>
              By proceeding, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline font-semibold">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline font-semibold">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              This site is protected by reCAPTCHA and the <br />
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                Google Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>
        </div>
      </div>

      {/* ===== LOGGING IN SPINNER DIALOG ===== */}
      <Dialog open={loggingIn} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 py-10 flex flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <h5 className="font-bold text-lg mb-1">Signing in…</h5>
          <p className="text-muted-foreground text-sm">Please wait while we verify your credentials</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
