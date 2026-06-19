"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CampaignSidebar from "../campaigns/CampaignSidebar";
import CampaignHeader from "../campaigns/CampaignHeader";
import ImportStep from "./ImportStep";
import TemplateStep from "./TemplateStep";
import PrintStep from "./PrintStep";
import { getCampaignStats } from "../campaigns/campaignUtils";
import type { CampaignProduct } from "../campaigns/types";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardShellProps {
  organizationName: string;
  organizationPlan: string;
  userEmail: string;
  products: CampaignProduct[];
  users: TeamUser[];
}

interface Template {
  id: string;
  name: string;
  desc: string;
  badge: string;
  color: "red" | "green" | "yellow";
}

const TEMPLATES: Template[] = [
  {
    id: "standard",
    name: "Standard Retail",
    desc: "Clean & readable tag for everyday shelves.",
    badge: "EVERYDAY LOW",
    color: "red",
  },
  {
    id: "promo",
    name: "Promo Offer",
    desc: "BOGO or special discount tag to drive sales.",
    badge: "BIG PROMO",
    color: "green",
  },
  {
    id: "clearance",
    name: "Clearance Special",
    desc: "High impact design to clear old stock fast.",
    badge: "CLEARANCE",
    color: "yellow",
  },
  {
    id: "minimal",
    name: "Minimalist Outline",
    desc: "Simple, border-only layout for premium items.",
    badge: "SPECIAL",
    color: "red",
  },
];

export default function DashboardShell({
  organizationName,
  organizationPlan,
  userEmail,
  products: initialProducts,
  users,
}: DashboardShellProps) {
  const [products, setProducts] = useState<CampaignProduct[]>(initialProducts);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("standard");
  const [showOriginalPrice, setShowOriginalPrice] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importedFile, setImportedFile] = useState<string | null>(null);
  const [isPrintDone, setIsPrintDone] = useState(false);

  // Accordion state: open Step 1 if no products, otherwise open Step 2
  const [activeAccordion, setActiveAccordion] = useState<1 | 2 | 3>(
    initialProducts.length === 0 ? 1 : 2
  );

  // Sync products client-side when a new list is uploaded
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(
          data.products.map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            code: p.code,
            promoPrice: p.promoPrice,
            crossPrice: p.crossPrice,
            validUntil: p.validUntil,
            offer: p.offer,
            status: p.status === "inactive" ? "inactive" : "active",
          }))
        );
        // Automatically move to template selection step once products are imported
        setActiveAccordion(2);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  // Calculate stats
  const stats = getCampaignStats(products);

  // Calculate average discount lift
  const calculateAverageLift = (items: CampaignProduct[]) => {
    const productsWithCrossPrice = items.filter(
      (p) => p.crossPrice && p.crossPrice > 0
    );
    if (productsWithCrossPrice.length === 0) return 18; // Default mock lift
    const totalLift = productsWithCrossPrice.reduce((sum, p) => {
      const discount = ((p.crossPrice! - p.promoPrice) / p.crossPrice!) * 100;
      return sum + Math.max(0, discount);
    }, 0);
    return Math.round(totalLift / productsWithCrossPrice.length);
  };
  const avgLift = calculateAverageLift(products);

  // Get dynamic distribution count for the bar chart
  const getDiscountRanges = () => {
    let r1 = 0; // 0-15%
    let r2 = 0; // 15-30%
    let r3 = 0; // 30-50%
    let r4 = 0; // 50%+

    products.forEach((p) => {
      if (!p.crossPrice || p.crossPrice <= 0) return;
      const pct = ((p.crossPrice - p.promoPrice) / p.crossPrice) * 100;
      if (pct <= 15) r1++;
      else if (pct <= 30) r2++;
      else if (pct <= 50) r3++;
      else r4++;
    });

    if (r1 === 0 && r2 === 0 && r3 === 0 && r4 === 0) {
      return [3, 8, 5, 2]; // Mock visuals if empty
    }
    return [r1, r2, r3, r4];
  };
  const discountDistribution = getDiscountRanges();
  const maxDiscountVal = Math.max(...discountDistribution, 1);

  // Calculate onboarding progress count
  const completedCount =
    (products.length > 0 ? 1 : 0) +
    (selectedTemplate ? 1 : 0) +
    (isPrintDone ? 1 : 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090b0f] text-zinc-200">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <CampaignSidebar
          organizationPlan={organizationPlan}
          organizationName={organizationName}
          stats={stats}
          activeItem="dashboard"
        />

        {/* Main Content Pane */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <CampaignHeader userEmail={userEmail} />

          {/* Body Content */}
          <div className="flex-1 px-4 py-6 sm:px-8 space-y-8 max-w-[1600px] mx-auto w-full">
            {/* Title / Description */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                  </span>
                  TagShelves Console
                </h1>
                <p className="text-zinc-500 text-[11px] mt-1 font-medium">
                  Real-time tags, campaign insights, and quick setup configuration.
                </p>
              </div>

              <div className="text-[10px] text-zinc-500 flex items-center gap-2 bg-[#121620]/30 border border-zinc-800/80 rounded-lg px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Sync Active
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Listed Products */}
              <div className="group relative rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-5 hover:border-zinc-700/80 hover:bg-[#111520]/80 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Total Products
                    </p>
                    <h3 className="text-2xl font-black text-white mt-2 group-hover:text-red-500 transition-colors">
                      {products.length}
                    </h3>
                  </div>
                  <span className="p-2.5 bg-red-950/20 text-red-500 rounded-lg border border-red-900/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 flex items-center gap-1 font-semibold">
                  <span className="text-emerald-400">✓ List Loaded</span>
                  from catalog
                </p>
              </div>

              {/* Card 2: Active Campaigns */}
              <div className="group relative rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-5 hover:border-zinc-700/80 hover:bg-[#111520]/80 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Active Offers
                    </p>
                    <h3 className="text-2xl font-black text-white mt-2 group-hover:text-emerald-500 transition-colors">
                      {stats.activeOffers}
                    </h3>
                  </div>
                  <span className="p-2.5 bg-emerald-950/20 text-emerald-500 rounded-lg border border-emerald-900/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 flex items-center gap-1 font-semibold">
                  <span className="text-red-400">{stats.expiredOffers} expired</span>
                  requiring updates
                </p>
              </div>

              {/* Card 3: Estimated Savings */}
              <div className="group relative rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-5 hover:border-zinc-700/80 hover:bg-[#111520]/80 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Est. Savings
                    </p>
                    <h3 className="text-2xl font-black text-white mt-2 group-hover:text-amber-500 transition-colors">
                      ${stats.estimatedSavings.toFixed(2)}
                    </h3>
                  </div>
                  <span className="p-2.5 bg-amber-950/20 text-amber-500 rounded-lg border border-amber-900/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 flex items-center gap-1 font-semibold">
                  Total promo markdown values
                </p>
              </div>

              {/* Card 4: Lift / Average Discount */}
              <div className="group relative rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-5 hover:border-zinc-700/80 hover:bg-[#111520]/80 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Average Discount
                    </p>
                    <h3 className="text-2xl font-black text-white mt-2 group-hover:text-blue-500 transition-colors">
                      {avgLift}%
                    </h3>
                  </div>
                  <span className="p-2.5 bg-blue-950/20 text-blue-500 rounded-lg border border-blue-900/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 flex items-center gap-1 font-semibold">
                  Average discount rate lift
                </p>
              </div>
            </div>

            {/* Split Grid for Dashboard Items (Onboarding) and Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT COLUMN: Analytics Charts (7/12 cols) */}
              <div className="lg:col-span-7 space-y-8">

                {/* Visual SVG Chart: Print Volumes */}
                <div className="rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Weekly Shelf Tag Activity
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Tag prints and design iterations generated per day.
                      </p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-900/30">
                      +28.4% WoW
                    </span>
                  </div>

                  {/* SVG Chart Area */}
                  <div className="w-full h-[200px] relative">
                    <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                      <defs>
                        {/* Area glow gradient */}
                        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="0" y1="180" x2="500" y2="180" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="0" y1="130" x2="500" y2="130" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />

                      {/* Area Path */}
                      <path
                        d="M 10 180 Q 80 140 150 160 T 290 80 T 430 40 L 490 30 L 490 180 Z"
                        fill="url(#area-gradient)"
                      />

                      {/* Line Path */}
                      <path
                        d="M 10 180 Q 80 140 150 160 T 290 80 T 430 40 L 490 30"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data dots */}
                      <circle cx="10" cy="180" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="80" cy="148" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="150" cy="160" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="220" cy="120" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="290" cy="80" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="360" cy="65" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="430" cy="40" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />
                      <circle cx="490" cy="30" r="5" fill="#EF4444" className="cursor-pointer hover:r-7 transition-all" />

                      {/* X Labels */}
                      <text x="10" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Mon</text>
                      <text x="80" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Tue</text>
                      <text x="150" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Wed</text>
                      <text x="220" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Thu</text>
                      <text x="290" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Fri</text>
                      <text x="360" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Sat</text>
                      <text x="430" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Sun</text>
                      <text x="490" y="196" fill="#4b5563" fontSize="8" textAnchor="middle" fontWeight="bold">Today</text>
                    </svg>
                  </div>
                </div>

                {/* Grid of secondary visual components */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Visual SVG Chart: Discount Distribution */}
                  <div className="rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Discount Distribution
                      </h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        Categorized lift rates across active offers.
                      </p>
                    </div>

                    <div className="h-[120px] w-full flex items-end justify-between px-2 pt-4">
                      {["0-15%", "15-30%", "30-50%", "50%+"].map((label, idx) => {
                        const count = discountDistribution[idx] || 0;
                        const barHeight = Math.round((count / maxDiscountVal) * 80); // max 80%
                        return (
                          <div key={label} className="flex flex-col items-center flex-1 space-y-2 group">
                            <span className="text-[9px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              {count}
                            </span>
                            <div className="w-8 bg-zinc-800 rounded-t-sm relative overflow-hidden h-20 flex items-end">
                              <div
                                className="w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t-sm group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all duration-300"
                                style={{ height: `${barHeight}%` }}
                              />
                            </div>
                            <span className="text-[8px] text-zinc-500 font-bold tracking-tight">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="rounded-xl border border-zinc-800/60 bg-[#0d1017]/80 p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Recent Catalog Imports
                      </h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        Latest products successfully stored in database.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {products.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between border-b border-zinc-900 pb-2 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white truncate leading-tight">
                              {prod.name}
                            </p>
                            <p className="text-[9px] text-zinc-500 truncate mt-0.5">
                              Code: {prod.code}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-black text-red-500 leading-tight">
                              ${prod.promoPrice.toFixed(2)}
                            </p>
                            {prod.crossPrice && (
                              <p className="text-[8px] text-zinc-500 line-through">
                                ${prod.crossPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {products.length === 0 && (
                        <div className="text-center py-6 text-zinc-600 text-[10px] italic">
                          No products imported yet. Import product data to view recent logs.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: Onboarding Setup Guide Widget (5/12 cols) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Onboarding Guide Card */}
                <div className="rounded-xl border border-zinc-800 bg-[#0c0e12] p-6 shadow-xl space-y-5">
                  <div className="border-b border-zinc-800 pb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        Quick Start Setup Guide
                      </h3>
                      <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-bold px-2 py-0.5 rounded">
                        {completedCount} / 3 Steps
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out"
                        style={{ width: `${(completedCount / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Onboarding Accordion List */}
                  <div className="space-y-4">

                    {/* STEP 1: IMPORT LIST */}
                    <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#11141c]/40">
                      <button
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 1 ? 2 : 1)}
                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-800/20 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${products.length > 0
                                ? "bg-emerald-500 border-emerald-500 text-black"
                                : "bg-transparent border-zinc-700 text-zinc-400"
                              }`}
                          >
                            {products.length > 0 ? "✓" : "1"}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">Import Product List</p>
                            <p className="text-[9px] text-zinc-500 leading-none mt-0.5">
                              {products.length > 0
                                ? `${products.length} products stored in database`
                                : "Upload CSV file or run mock database loader"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-zinc-500 transition-transform ${activeAccordion === 1 ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </button>

                      {activeAccordion === 1 && (
                        <div className="p-4 border-t border-zinc-800/50 bg-[#0d1017]/40 flex justify-center">
                          <ImportStep
                            isDragOver={isDragOver}
                            setIsDragOver={setIsDragOver}
                            importedFile={importedFile}
                            setImportedFile={setImportedFile}
                            onProductsUploaded={fetchProducts}
                          />
                        </div>
                      )}
                    </div>

                    {/* STEP 2: SELECT TEMPLATE */}
                    <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#11141c]/40">
                      <button
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 2 ? 3 : 2)}
                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-800/20 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${selectedTemplate
                                ? "bg-emerald-500 border-emerald-500 text-black"
                                : "bg-transparent border-zinc-700 text-zinc-400"
                              }`}
                          >
                            {selectedTemplate ? "✓" : "2"}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">Choose Tag Design</p>
                            <p className="text-[9px] text-zinc-500 leading-none mt-0.5">
                              {selectedTemplate
                                ? `Active design: ${TEMPLATES.find((t) => t.id === selectedTemplate)?.name}`
                                : "Select display style for your tag campaign"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-zinc-500 transition-transform ${activeAccordion === 2 ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </button>

                      {activeAccordion === 2 && (
                        <div className="p-4 border-t border-zinc-800/50 bg-[#0d1017]/40">
                          <TemplateStep
                            templates={TEMPLATES}
                            selectedTemplate={selectedTemplate}
                            setSelectedTemplate={setSelectedTemplate}
                          />
                        </div>
                      )}
                    </div>

                    {/* STEP 3: CONFIGURE & DOWNLOAD PRINT SHEET */}
                    <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#11141c]/40">
                      <button
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 3 ? 1 : 3)}
                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-800/20 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${isPrintDone
                                ? "bg-emerald-500 border-emerald-500 text-black"
                                : "bg-transparent border-zinc-700 text-zinc-400"
                              }`}
                          >
                            {isPrintDone ? "✓" : "3"}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">Preview & Print Shelf Tags</p>
                            <p className="text-[9px] text-zinc-500 leading-none mt-0.5">
                              {isPrintDone
                                ? "Print sheets downloaded successfully"
                                : "Configure strikethroughs, barcodes & export PDF"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-zinc-500 transition-transform ${activeAccordion === 3 ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </button>

                      {activeAccordion === 3 && (
                        <div className="p-4 border-t border-zinc-800/50 bg-[#0d1017]/40">
                          <PrintStep
                            showOriginalPrice={showOriginalPrice}
                            setShowOriginalPrice={setShowOriginalPrice}
                            showBarcode={showBarcode}
                            setShowBarcode={setShowBarcode}
                            selectedTemplate={selectedTemplate}
                            onPrintComplete={() => setIsPrintDone(true)}
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
