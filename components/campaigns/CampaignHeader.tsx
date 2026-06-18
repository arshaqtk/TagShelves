"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CampaignHeaderProps {
  userEmail: string;
}

export default function CampaignHeader({ userEmail }: CampaignHeaderProps) {
  const [profilePic, setProfilePic] = useState<string>("");
  const pathname = usePathname();

  const pageName = pathname?.startsWith("/dashboard")
    ? "dashboard"
    : pathname?.startsWith("/profile")
    ? "profile"
    : "campaigns";

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (data.success && data.user && data.user.profilePic) {
          setProfilePic(data.user.profilePic);
        }
      } catch (err) {
        console.error("Failed to fetch avatar:", err);
      }
    };
    fetchUserAvatar();
  }, []);

  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800/80 bg-[#0b0e13] px-4 sm:px-6 select-none shrink-0">
      <div className="flex items-center gap-3 text-[11px]">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          Back
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="flex items-center gap-1.5 text-[#00DC82] capitalize font-bold">
          <span className="h-1.5 w-4 rounded-full bg-[#00DC82]" />
          {pageName}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-zinc-500">
        <button type="button" className="rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 px-3 py-1.5 text-zinc-350 transition-colors cursor-pointer">
          Shop
        </button>
        <Link href="/profile" className="flex items-center gap-2.5 group cursor-pointer">
          <span className="hidden sm:inline group-hover:text-zinc-300 transition-colors">{userEmail}</span>
          <div className="h-6.5 w-6.5 rounded-full border border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center transition-all group-hover:border-zinc-500 shrink-0">
            {profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePic} alt={userEmail} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9px] font-bold text-zinc-400 uppercase">
                {userEmail?.substring(0, 2)}
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
