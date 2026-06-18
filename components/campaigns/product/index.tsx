"use client";

import { useState, useEffect } from "react";
import type { CampaignProduct } from "../types";
import SingleProductForm from "./SingleProductForm";
import BulkImportTab from "./BulkImportTab";

interface AddProductModalProps {
  open: boolean;
  editProduct?: CampaignProduct | null;
  onClose: () => void;
  onProductSaved: (product: CampaignProduct, isEdit: boolean) => void;
  onBulkSaved: (products: CampaignProduct[]) => void;
}

type Tab = "single" | "bulk";

export default function AddProductModal({
  open,
  editProduct,
  onClose,
  onProductSaved,
  onBulkSaved,
}: AddProductModalProps) {
  const [tab, setTab] = useState<Tab>("single");

  // Always land on single tab when opening in edit mode
  useEffect(() => {
    if (editProduct) setTab("single");
  }, [editProduct, open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-[#0d1017] shadow-2xl shadow-black/60 border-l border-zinc-800"
        style={{ animation: "productPanelSlideIn 0.22s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {editProduct
                ? "Update product details."
                : "Add one item or bulk import from a CSV file."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab switcher (hidden when editing) */}
        {!editProduct && (
          <TabBar active={tab} onChange={setTab} />
        )}

        {/* Active content */}
        {tab === "single" ? (
          <SingleProductForm
            editProduct={editProduct}
            onClose={onClose}
            onProductSaved={onProductSaved}
          />
        ) : (
          <BulkImportTab onClose={onClose} onBulkSaved={onBulkSaved} />
        )}
      </aside>

      <style>{`
        @keyframes productPanelSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Tab bar sub-component ────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-zinc-800 shrink-0">
      <TabButton
        label="Single Product"
        value="single"
        active={active}
        onChange={onChange}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
          </svg>
        }
      />
      <TabButton
        label="Bulk Import"
        value="bulk"
        active={active}
        onChange={onChange}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        }
      />
    </div>
  );
}

function TabButton({
  label,
  value,
  active,
  onChange,
  icon,
}: {
  label: string;
  value: Tab;
  active: Tab;
  onChange: (t: Tab) => void;
  icon: React.ReactNode;
}) {
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold transition-all cursor-pointer border-b-2 ${
        isActive
          ? "border-red-500 text-white bg-zinc-900/30"
          : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
