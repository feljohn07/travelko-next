"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import defaultProfile from "@/assets/defaultUser.png";

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

export default function AdminHeader() {
  const { user, profilePicture } = useAuth();

  const adminName =
    user?.fullName || user?.name || user?.username || "Administrator";
  const adminPic =
    profilePicture || user?.profileImageUrl || user?.profilePicture || null;

  return (
    <header className="hidden md:flex sticky top-0 z-20 bg-white border-b border-gray-100 h-16 items-center justify-between px-6 shadow-2xs shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          TravelKo Admin Portal
        </span>
      </div>

      {/* Top right corner profile widget */}
      <div className="flex items-center gap-3 py-1.5 px-2.5 rounded-xl">
        <div className="relative w-10 h-10 shrink-0 rounded-full aspect-square overflow-hidden border border-gray-200 shadow-2xs">
          <Image
            src={getProfilePictureUrl(adminPic) || defaultProfile}
            alt={adminName}
            fill
            sizes="40px"
            className="object-cover"
            unoptimized={!!adminPic}
          />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-sm text-gray-800 leading-tight max-w-[160px] md:max-w-[220px] truncate">
            {adminName}
          </span>
          <span className="text-xs text-gray-500 font-medium leading-tight">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
