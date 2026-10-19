"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import defaultProfile from "@/assets/defaultUser.png";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserCheck,
  FaSignOutAlt,
  FaCalendarAlt,
  FaBars,
  FaFileInvoiceDollar,
} from "react-icons/fa";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: FaTachometerAlt },
  { label: "Coordinators", href: "/admin/coordinators", icon: FaUsers },
  { label: "Bookings", href: "/admin/booking-applications", icon: FaCalendarAlt },
  { label: "Coordinator Applications", href: "/admin/applications", icon: FaUserCheck },
  { label: "Accounting", href: "/admin/accounting", icon: FaFileInvoiceDollar },
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

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profilePicture, logout } = useAuth();

  const adminName =
    user?.fullName || user?.name || user?.username || "Administrator";
  const adminPic =
    profilePicture || user?.profileImageUrl || user?.profilePicture || null;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      router.push("/");
    }, 1200);
  };

  const isActive = (href) => pathname.startsWith(href);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-gray-900 text-white flex items-center justify-between px-4 h-16 shadow-sm border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white focus:outline-none transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <FaBars size={18} />
          </button>
          <Link href="/" className="font-brand text-2xl text-primary font-normal hover:opacity-95 transition-opacity">
            TravelKo
          </Link>
        </div>

        {/* Top Right Corner: Admin Profile */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 shrink-0 rounded-full aspect-square overflow-hidden border border-gray-700">
            <Image
              src={getProfilePictureUrl(adminPic) || defaultProfile}
              alt={adminName}
              fill
              sizes="36px"
              className="object-cover"
              unoptimized={!!adminPic}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-xs text-white leading-tight max-w-[110px] truncate">
              {adminName}
            </span>
            <span className="text-[10px] text-gray-400 font-medium leading-tight">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex bg-gray-900 text-white min-h-screen py-4 px-3 flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center mb-6 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && <h5 className="m-0 font-bold text-lg">Admin Panel</h5>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white focus:outline-none transition-colors"
            aria-label="Toggle sidebar"
          >
            <FaBars size={14} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-emerald-950 text-primary"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                title={label}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-red-950 text-red-100 hover:bg-red-900 transition-colors focus:outline-none cursor-pointer w-full"
          title="Logout"
        >
          <FaSignOutAlt size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] bg-gray-900 text-white p-0 border-r-0 flex flex-col justify-between">
          <div>
            <SheetHeader className="p-4 border-b border-gray-800">
              <SheetTitle className="text-left font-bold text-lg text-white">Admin Menu</SheetTitle>
            </SheetHeader>
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0 rounded-full aspect-square overflow-hidden border border-gray-700">
                <Image
                  src={getProfilePictureUrl(adminPic) || defaultProfile}
                  alt={adminName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized={!!adminPic}
                />
              </div>
              <div className="min-w-0">
                <h6 className="font-bold text-sm text-white truncate max-w-[170px]">{adminName}</h6>
                <p className="text-xs text-gray-400 font-medium">Admin</p>
              </div>
            </div>
            <div className="p-4">
              <nav className="flex flex-col gap-1.5">
                {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-emerald-950 text-primary"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-red-950 text-red-100 hover:bg-red-900 transition-colors focus:outline-none cursor-pointer w-full text-left"
            >
              <FaSignOutAlt size={18} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Modal */}
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
