// Shared types and constants for the Add Product modal and its sub-components

export interface ProductFormData {
  name: string;
  code: string;
  promoPrice: string;
  crossPrice: string;
  validUntil: string;
  offer: string;
  status: "active" | "inactive";
}

export interface ParsedRow {
  name: string;
  code: string;
  promoPrice: number;
  crossPrice?: number;
  validUntil?: string;
  offer?: string;
  status: "active" | "inactive";
  _error?: string;
}

export const EMPTY_FORM: ProductFormData = {
  name: "",
  code: "",
  promoPrice: "",
  crossPrice: "",
  validUntil: "",
  offer: "",
  status: "active",
};

export const OFFER_PRESETS = [
  "Discount",
  "Flash Sale",
  "BOGO",
  "Clearance",
  "Bundle Deal",
  "Promo",
];

export const inputCls =
  "w-full rounded-lg border border-zinc-800 bg-[#0a0c10] px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/40";

export const cancelBtnCls =
  "flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95 cursor-pointer";

export const submitBtnCls =
  "flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-950/30 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
