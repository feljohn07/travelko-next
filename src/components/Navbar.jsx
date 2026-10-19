"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaTachometerAlt, FaUser, FaSignOutAlt } from "react-icons/fa";
import defaultProfile from "@/assets/defaultUser.png";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/tours", label: "Tours" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About Us" },
];

const getProfilePictureUrl = (pic) => {
  if (!pic) return null;
  if (pic.startsWith("http://") || pic.startsWith("https://") || pic.startsWith("data:")) {
    return pic;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPic = pic.startsWith("/") ? pic : `/${pic}`;
  return `${cleanBase}${cleanPic}`;
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, profilePicture, logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-brand text-2xl text-primary hover:opacity-90 transition-opacity"
          >
            TravelKo
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(href, exact)
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Auth area */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-2 focus:outline-none flex items-center justify-center rounded-full">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary hover:ring-4 transition-all shrink-0 cursor-pointer aspect-square">
                    <Image
                      src={getProfilePictureUrl(profilePicture) || defaultProfile}
                      alt="Profile"
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={!!profilePicture}
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border border-gray-100 shadow-xl bg-white/95 backdrop-blur-md">
                  <div className="px-3 py-2.5 mb-1.5 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{user?.fullName || "Coordinator"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/coordinator/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl text-gray-700 hover:bg-gray-55 hover:text-gray-900 focus:bg-gray-55 focus:text-gray-900 transition-colors cursor-pointer"
                    >
                      <FaTachometerAlt size={14} className="text-gray-450" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/coordinator/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl text-gray-700 hover:bg-gray-55 hover:text-gray-900 focus:bg-gray-55 focus:text-gray-900 transition-colors cursor-pointer"
                    >
                      <FaUser size={14} className="text-gray-450" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5 bg-gray-50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 transition-colors cursor-pointer"
                  >
                    <FaSignOutAlt size={14} />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-current mb-1.5 transition-transform" />
            <span className="block w-5 h-0.5 bg-current mb-1.5" />
            <span className="block w-5 h-0.5 bg-current transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-200 ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href, exact)
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-100">
            {isLoggedIn ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 aspect-square">
                    <Image
                      src={getProfilePictureUrl(profilePicture) || defaultProfile}
                      alt="Profile"
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={!!profilePicture}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{user?.fullName || "Coordinator"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                  </div>
                </div>
                <Link
                  href="/coordinator/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <FaTachometerAlt size={15} className="text-gray-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/coordinator/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <FaUser size={15} className="text-gray-400" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <FaSignOutAlt size={15} className="text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
