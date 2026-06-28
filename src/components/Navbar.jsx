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
  { href: "/about", label: "About Us" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, profilePicture, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
                <DropdownMenuTrigger className="ml-2 focus:outline-none">
                  <Image
                    src={profilePicture || defaultProfile}
                    alt="Profile"
                    width={38}
                    height={38}
                    className="rounded-full object-cover ring-2 ring-primary cursor-pointer hover:ring-4 transition-all"
                    unoptimized={!!profilePicture}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href="/coordinator/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <FaTachometerAlt size={15} />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/coordinator/profile" className="flex items-center gap-2 cursor-pointer">
                      <FaUser size={15} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt size={15} />
                    Logout
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
              <>
                <Link
                  href="/coordinator/dashboard"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FaTachometerAlt size={14} /> Dashboard
                </Link>
                <Link
                  href="/coordinator/profile"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FaUser size={14} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt size={14} /> Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
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
