"use client";

import { useState } from "react";
import Link from "next/link";
import type { CampaignStats } from "./types";

interface CampaignSidebarProps {
  organizationPlan: string;
  organizationName: string;
  stats: CampaignStats;
  activeItem?: string;
}

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "campaigns",
    label: "Campaigns",
    href: "/campaigns",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "tags",
    label: "Pr-Set Tags",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function CampaignSidebar({
  stats,
  activeItem: activeItemProp = "campaigns",
}: CampaignSidebarProps) {
  const [activeItem, setActiveItem] = useState(activeItemProp);

  const formatStatNum = (num: number) => {
    return num < 10 ? `0${num}` : num.toString();
  };

  const totalOffers = stats.activeOffers + stats.expiredOffers;
  const progressPercent = totalOffers > 0 ? (stats.activeOffers / totalOffers) * 100 : 50;

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 border-r border-zinc-800/70 bg-[#0d1017] w-[200px]"
      style={{ minHeight: "100vh" }}
    >
      {/* Logo Row */}
      <div className="flex items-start gap-2.5 px-5 pt-6 pb-8">
        <span className="mt-0.5 shrink-0 text-[#00DC82]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 transform -rotate-45"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
          </svg>
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-black tracking-tight text-white leading-tight">
            tagshelves.com
          </span>
          <span className="text-[9px] text-zinc-500 font-semibold mt-0.5">
            create, print, organize
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="px-2 space-y-1">
        <ul>
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id} className="relative">
                <Link
                  href={item.href}
                  onClick={() => setActiveItem(item.id)}
                  className={`relative flex items-center gap-3 py-2.5 px-3.5 text-[11px] font-semibold transition-all duration-150 border-l-[3px] ${
                    isActive
                      ? "bg-[#181d28] border-[#00DC82] text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {/* Icon */}
                  <span className={isActive ? "text-white" : "text-zinc-500"}>
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span className="truncate leading-none">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Thin Separator Line */}
      <div className="mx-4 my-6 border-t border-zinc-800/80" />

      {/* Overview Section */}
      <div className="px-4 space-y-4">
        {/* Title with progress bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black tracking-wider text-[#00DC82] uppercase shrink-0">
            Overview
          </span>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="bg-[#00DC82] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-3 pt-1 text-[11px] font-semibold">
          {/* Active Offers */}
          <div className="flex items-center justify-between text-[#00DC82]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00DC82]" />
              <span>Active Offers:</span>
            </div>
            <span className="tabular-nums">{formatStatNum(stats.activeOffers)}</span>
          </div>

          {/* Products On Promo */}
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span>Products On Promo</span>
            </div>
            <span className="tabular-nums">{formatStatNum(stats.productCount)}</span>
          </div>

          {/* Expired Offers */}
          <div className="flex items-center justify-between text-[#EF4444]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
              <span>Expired Offers</span>
            </div>
            <span className="tabular-nums">{formatStatNum(stats.expiredOffers)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
