"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import Image from "next/image";
import defaultProfile from "@/assets/defaultUser.png";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/coordinator/dashboard", icon: FaTachometerAlt },
  { label: "Tour Packages", href: "/coordinator/tours", icon: FaMapMarkerAlt },
  { label: "Bookings", href: "/coordinator/bookings", icon: FaCalendarAlt },
  { label: "Profile", href: "/coordinator/profile", icon: FaUser },
];

const getProfilePictureUrl = (pic) => {
  if (!pic || typeof pic !== "string") return null;
  if (pic.startsWith("http://") || pic.startsWith("https://") || pic.startsWith("data:")) {
    return pic;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPic = pic.startsWith("/") ? pic : `/${pic}`;
  return `${cleanBase}${cleanPic}`;
};

export default function CoordinatorNav({ collapsed, onToggleCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profilePicture, updateProfilePicture, updateUser, token, logout } = useAuth();

  const [remoteCoordinator, setRemoteCoordinator] = useState(null);

  const coordinatorName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    remoteCoordinator?.fullName ||
    "Coordinator";

  const coordinatorPic =
    profilePicture ||
    user?.profileImageUrl ||
    user?.profilePicture ||
    remoteCoordinator?.profileImageUrl ||
    null;

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    api
      .get("/auth/coordinator")
      .then((res) => {
        if (!isMounted || !res.data) return;
        const data = res.data;
        setRemoteCoordinator(data);
        if (data.profileImageUrl && !profilePicture && updateProfilePicture) {
          updateProfilePicture(data.profileImageUrl);
        }
        if (updateUser && data.fullName) {
          updateUser(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch coordinator profile for header:", err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [token, profilePicture, updateProfilePicture, updateUser]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      router.push("/");
    }, 1200);
  };

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 h-16 shadow-xs relative">
        {/* Left: Mobile Menu Toggle Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Open mobile menu"
        >
          <FaBars size={20} />
        </button>

        {/* Desktop Sidebar Spacer (takes the space of collapsed/expanded sidebar) */}
        <div
          className="hidden md:block shrink-0 transition-all duration-200"
          style={{ width: collapsed ? 72 : 230 }}
        />

        {/* Center: Brand name */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="font-brand text-2xl text-primary font-normal hover:opacity-95 transition-opacity"
          >
            TravelKo
          </Link>
        </div>

        {/* Right: Coordinator Profile Widget */}
        <Link
          href="/coordinator/profile"
          className="flex items-center gap-3 py-1.5 px-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
          title="Coordinator Profile"
        >
          <div className="relative w-10 h-10 shrink-0 rounded-full aspect-square overflow-hidden border border-gray-200 shadow-2xs group-hover:border-primary transition-colors">
            <Image
              src={getProfilePictureUrl(coordinatorPic) || defaultProfile}
              alt={coordinatorName}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized={!!coordinatorPic}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-sm text-gray-800 leading-tight group-hover:text-primary transition-colors max-w-[120px] sm:max-w-[180px] md:max-w-[220px] truncate">
              {coordinatorName}
            </span>
            <span className="text-xs text-gray-500 font-medium leading-tight">
              Coordinator
            </span>
          </div>
        </Link>
      </header>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-100 fixed left-0 top-0 h-screen pt-16 z-20 transition-all duration-200 ${
          collapsed ? "w-[72px]" : "w-[230px]"
        }`}
      >
        <div className={`p-3 flex flex-col gap-2 h-full justify-between ${collapsed ? "items-center" : ""}`}>
          <div className="flex flex-col gap-2">
            {/* Sidebar Collapse Toggle */}
            <button
              onClick={onToggleCollapsed}
              className={`flex items-center gap-3 rounded-xl text-gray-700 hover:bg-gray-55 transition-colors focus:outline-none cursor-pointer ${
                collapsed ? "h-10 w-10 justify-center p-0" : "w-full p-2.5"
              }`}
            >
              <div className={`h-10 w-10 shrink-0 grid place-items-center rounded-xl text-gray-500 ${collapsed ? "" : "bg-gray-50"}`}>
                <FaBars size={18} />
              </div>
              {!collapsed && <span className="font-bold text-sm">Menu</span>}
            </button>

            {/* Menu Links */}
            <nav className={`flex flex-col gap-1 ${collapsed ? "w-full items-center" : ""}`}>
              {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl transition-all ${
                      collapsed 
                        ? "h-10 w-10 justify-center p-0" 
                        : "w-full p-2.5"
                    } ${
                      active
                        ? collapsed
                          ? "bg-primary/20 text-primary"
                          : "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-55"
                    }`}
                    title={label}
                  >
                    <div
                      className={`h-10 w-10 shrink-0 grid place-items-center rounded-xl transition-colors ${
                        active && !collapsed ? "bg-primary/20 text-primary" : active ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    {!collapsed && <span className="font-bold text-sm">{label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-650 transition-colors focus:outline-none cursor-pointer ${
              collapsed ? "h-10 w-10 justify-center p-0" : "w-full p-2.5"
            }`}
            title="Logout"
          >
            <div className="h-10 w-10 shrink-0 grid place-items-center rounded-xl text-gray-500 group-hover:text-red-600">
              <FaSignOutAlt size={18} />
            </div>
            {!collapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>


      {/* ===== MOBILE SHEET DRAWER (triggered by profile click) ===== */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r-0">
          <SheetHeader className="p-4 border-b border-gray-100">
            <SheetTitle className="text-left font-bold text-lg">Coordinator Menu</SheetTitle>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0 rounded-full aspect-square overflow-hidden border border-gray-200">
                <Image
                  src={getProfilePictureUrl(coordinatorPic) || defaultProfile}
                  alt={coordinatorName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized={!!coordinatorPic}
                />
              </div>
              <div className="min-w-0">
                <h6 className="font-bold text-gray-800 truncate max-w-[170px]">{coordinatorName}</h6>
                <p className="text-xs text-gray-500 font-medium">Coordinator</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5 mt-2">
              {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-primary" : "text-gray-500"} />
                    <span className="font-bold text-sm">{label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none cursor-pointer w-full text-left"
              >
                <FaSignOutAlt size={18} className="text-gray-500" />
                <span className="font-bold text-sm">Logout</span>
              </button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* ===== LOGOUT MODAL ===== */}
      <Dialog open={loggingOut} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 py-10 flex flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <h5 className="font-bold text-lg mb-1">Logging out…</h5>
          <p className="text-muted-foreground text-sm">Please wait a moment</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
