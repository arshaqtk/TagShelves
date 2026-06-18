"use client";

import { useState } from "react";
import { calculateLift, formatDate, formatPrice } from "./campaignUtils";
import type { CampaignProduct, CampaignStats } from "./types";

interface CampaignTableProps {
  products: CampaignProduct[];
  stats: CampaignStats;
  onAddNew: () => void;
  onEdit: (product: CampaignProduct) => void;
  onDelete: (productId: string) => void;
}

const offerStyles = [
  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
  "bg-sky-500/15 text-sky-300 border-sky-500/25",
  "bg-amber-500/15 text-amber-300 border-amber-500/25",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
];

export default function CampaignTable({
  products,
  stats,
  onAddNew,
  onEdit,
  onDelete,
}: CampaignTableProps) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.offer ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (product: CampaignProduct) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    setDeleteError("");

    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed.");
      }

      onDelete(product.id);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#10131a] shadow-2xl shadow-black/30 overflow-hidden">

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-zinc-800 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-1">
          {/* Add New Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 h-7 rounded-md border border-red-700/60 bg-red-600/10 px-3 text-[10px] font-semibold text-red-400 hover:bg-red-600/20 hover:border-red-600 hover:text-red-300 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>

          {/* Search */}
          <div className="flex h-7 flex-1 min-w-0 items-center gap-2 rounded-md border border-zinc-800 bg-[#0c0f15] px-2.5 text-[10px] text-zinc-500 focus-within:border-zinc-700 transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search article or offer..."
              className="flex-1 bg-transparent outline-none text-zinc-300 placeholder-zinc-600 min-w-0"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-zinc-600 hover:text-zinc-400 transition">
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1 text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Expired ({stats.expiredOffers})
          </span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active ({stats.activeOffers})
          </span>
        </div>
      </div>

      {/* Delete error */}
      {deleteError && (
        <div className="border-b border-red-900/30 bg-red-950/20 px-4 py-2 text-[10px] text-red-400">
          {deleteError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-[11px]">
          <thead className="bg-[#0c0f15] text-[10px] text-zinc-500">
            <tr>
              <th className="w-8 px-3 py-2.5 font-medium">
                <input type="checkbox" className="h-3 w-3 accent-emerald-500" aria-label="Select all products" />
              </th>
              <th className="px-2 py-2.5 font-medium">Article Name</th>
              <th className="px-2 py-2.5 font-medium">Code</th>
              <th className="px-2 py-2.5 font-medium">Promo Price</th>
              <th className="px-2 py-2.5 font-medium">Cross Price</th>
              <th className="px-2 py-2.5 font-medium">Valid Until</th>
              <th className="px-2 py-2.5 font-medium">Offer</th>
              <th className="px-2 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="border-t border-zinc-800/80">
                <td colSpan={8} className="px-4 py-16 text-center">
                  {search ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-zinc-700">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="text-zinc-500 text-xs">No products matching &quot;{search}&quot;</p>
                      <button type="button" onClick={() => setSearch("")} className="text-[10px] text-zinc-600 hover:text-zinc-400 underline cursor-pointer">
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full border border-zinc-800 bg-zinc-900/40 p-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-zinc-600">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
                        </svg>
                      </div>
                      <p className="text-zinc-500 text-xs">No products yet. Add your first product to get started.</p>
                      <button
                        type="button"
                        onClick={onAddNew}
                        className="flex items-center gap-1.5 rounded-lg border border-red-700/50 bg-red-600/10 px-3 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-600/20 transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add First Product
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((product, index) => {
                const lift = calculateLift(product);
                const isActive = product.status === "active";
                const isDeleting = deletingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`border-t border-zinc-800/80 transition-colors ${
                      isDeleting ? "opacity-40" : "hover:bg-zinc-900/40"
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="h-3 w-3 accent-emerald-500" aria-label={`Select ${product.name}`} />
                    </td>
                    <td className="px-2 py-2.5 text-zinc-200 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                        <span className="truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-zinc-500 font-mono text-[10px]">{product.code}</td>
                    <td className="px-2 py-2.5">
                      <span className="font-semibold text-emerald-400">{formatPrice(product.promoPrice)}</span>
                      {lift > 0 && (
                        <span className="ml-1.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                          −{lift}%
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-zinc-500">
                      {product.crossPrice ? (
                        <span className="line-through">{formatPrice(product.crossPrice)}</span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-zinc-300">{formatDate(product.validUntil)}</td>
                    <td className="px-2 py-2.5">
                      {product.offer ? (
                        <span className={`rounded border px-2 py-1 text-[10px] font-semibold ${offerStyles[index % offerStyles.length]}`}>
                          {product.offer}
                        </span>
                      ) : (
                        <span className="text-zinc-700 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex gap-1.5">
                        {/* Edit */}
                        <button
                          type="button"
                          title="Edit product"
                          onClick={() => onEdit(product)}
                          disabled={isDeleting}
                          className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200 transition-all cursor-pointer disabled:opacity-40"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          title="Delete product"
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                          className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:border-red-800 hover:bg-red-950/30 hover:text-red-400 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {isDeleting ? (
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-zinc-800 px-4 py-2.5 text-[10px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddNew}
            className="rounded border border-zinc-800 bg-zinc-900/30 px-2.5 py-1 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            + Add New
          </button>
          <span className="text-zinc-600">
            {filtered.length} of {products.length} product{products.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </span>
        </div>
        <span>
          {products.length === 0
            ? "No products yet — add your first above."
            : `Est. savings per unit: ${formatPrice(stats.estimatedSavings)}`}
        </span>
      </div>
    </div>
  );
}
