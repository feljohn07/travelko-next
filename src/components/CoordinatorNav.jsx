"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

export default function CoordinatorNav({ collapsed, onToggleCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profilePicture, logout } = useAuth();

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
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-16 shadow-sm">
        {/* Left: Mobile Avatar Button (acts as drawer toggle) */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden relative h-10 w-10 focus:outline-none rounded-full cursor-pointer hover:opacity-90"
          aria-label="Open mobile menu"
        >
          <Image
            src={profilePicture || defaultProfile}
            alt="Coordinator"
            width={40}
            height={40}
            className="rounded-full object-cover"
            unoptimized={!!profilePicture}
          />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary border-2 border-white rounded-full flex items-center justify-center text-white text-[8px]">
            ≡
          </span>
        </button>

        {/* Desktop Sidebar Spacer (takes the space of collapsed/expanded sidebar) */}
        <div className="hidden md:block" style={{ width: collapsed ? 72 : 230 }} />

        {/* Center: Brand name */}
        <div className="font-brand text-2xl text-primary font-normal">
          TravelKo
        </div>

        {/* Right: Dashboard Status */}
        <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
          Coordinator
        </div>
      </header>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-100 fixed left-0 top-0 h-screen pt-16 z-20 transition-all duration-200 ${
          collapsed ? "w-[72px]" : "w-[230px]"
        }`}
      >
        <div className="p-3 flex flex-col gap-2 h-full justify-between">
          <div className="flex flex-col gap-2">
            {/* Sidebar Collapse Toggle */}
            <button
              onClick={onToggleCollapsed}
              className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
            >
              <div className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-gray-50 text-gray-500">
                <FaBars size={18} />
              </div>
              {!collapsed && <span className="font-bold text-sm">Menu</span>}
            </button>

            {/* Menu Links */}
            <nav className="flex flex-col gap-1">
              {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    title={label}
                  >
                    <div
                      className={`h-10 w-10 shrink-0 grid place-items-center rounded-xl transition-colors ${
                        active ? "bg-primary/20 text-primary" : "text-gray-500"
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
            className="flex items-center gap-3 p-2.5 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none cursor-pointer w-full"
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
              <Image
                src={profilePicture || defaultProfile}
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full object-cover border border-gray-200"
                unoptimized={!!profilePicture}
              />
              <div>
                <h6 className="font-bold text-gray-800">My Account</h6>
                <p className="text-xs text-gray-500">Coordinator Dashboard</p>
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
