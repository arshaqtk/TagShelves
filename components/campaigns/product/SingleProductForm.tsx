"use client";

import { useState, useEffect, ChangeEvent } from "react";
import type { CampaignProduct } from "../types";
import {
  EMPTY_FORM,
  OFFER_PRESETS,
  inputCls,
  cancelBtnCls,
  submitBtnCls,
  type ProductFormData,
} from "./types";
import FormField from "./ui/FormField";
import PriceInput from "./ui/PriceInput";
import Spinner from "./ui/Spinner";

interface SingleProductFormProps {
  editProduct?: CampaignProduct | null;
  onClose: () => void;
  onProductSaved: (product: CampaignProduct, isEdit: boolean) => void;
}

export default function SingleProductForm({
  editProduct,
  onClose,
  onProductSaved,
}: SingleProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!editProduct;

  // Populate form fields when an editProduct is passed in
  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        code: editProduct.code,
        promoPrice: editProduct.promoPrice.toString(),
        crossPrice: editProduct.crossPrice?.toString() ?? "",
        validUntil: editProduct.validUntil
          ? new Date(editProduct.validUntil).toISOString().split("T")[0]
          : "",
        offer: editProduct.offer ?? "",
        status: editProduct.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [editProduct]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.promoPrice) {
      setError("Name, article code and promo price are required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      promoPrice: parseFloat(form.promoPrice),
      crossPrice: form.crossPrice ? parseFloat(form.crossPrice) : undefined,
      validUntil: form.validUntil || undefined,
      offer: form.offer.trim() || undefined,
      status: form.status,
    };

    try {
      const url = isEdit ? `/api/products/${editProduct!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save.");

      const raw = isEdit ? data.product : (data.products?.[0] ?? data.product);
      const saved: CampaignProduct = {
        id: raw._id ?? editProduct!.id,
        name: raw.name,
        code: raw.code,
        promoPrice: raw.promoPrice,
        crossPrice: raw.crossPrice,
        validUntil: raw.validUntil ? new Date(raw.validUntil).toISOString() : null,
        offer: raw.offer ?? null,
        status: raw.status ?? "active",
      };

      onProductSaved(saved, isEdit);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const discountPct =
    form.promoPrice && form.crossPrice &&
    parseFloat(form.crossPrice) > parseFloat(form.promoPrice)
      ? Math.round(
          ((parseFloat(form.crossPrice) - parseFloat(form.promoPrice)) /
            parseFloat(form.crossPrice)) *
            100
        )
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">

        {/* Error alert */}
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Article Name */}
        <FormField label="Article Name" required>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Farinha De Trigo 300g"
            required
            className={inputCls}
          />
        </FormField>

        {/* Article Code */}
        <FormField label="Article Code" required>
          <input
            name="code"
            type="text"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. 02145A45"
            required
            className={`${inputCls} uppercase`}
          />
        </FormField>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Promo Price" required>
            <PriceInput
              name="promoPrice"
              value={form.promoPrice}
              onChange={handleChange}
              accent="text-emerald-500"
            />
          </FormField>
          <FormField label="Cross Price">
            <PriceInput
              name="crossPrice"
              value={form.crossPrice}
              onChange={handleChange}
              accent="text-zinc-500"
            />
          </FormField>
        </div>

        {/* Discount preview */}
        {discountPct !== null && (
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-semibold">Discount preview</span>
            <span className="text-[11px] font-bold text-emerald-300">{discountPct}% off</span>
          </div>
        )}

        {/* Valid Until */}
        <FormField label="Valid Until">
          <input
            name="validUntil"
            type="date"
            value={form.validUntil}
            onChange={handleChange}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </FormField>

        {/* Offer Type */}
        <FormField label="Offer Type">
          <input
            name="offer"
            type="text"
            value={form.offer}
            onChange={handleChange}
            placeholder="e.g. Discount 25%"
            list="sp-offer-presets"
            className={inputCls}
          />
          <datalist id="sp-offer-presets">
            {OFFER_PRESETS.map((p) => <option key={p} value={p} />)}
          </datalist>
          {/* Quick-select chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {OFFER_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, offer: p }))}
                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold transition-all cursor-pointer ${
                  form.offer === p
                    ? "border-emerald-600 bg-emerald-600/20 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </FormField>

        {/* Status toggle */}
        <FormField label="Status">
          <div className="flex gap-3">
            {(["active", "inactive"] as const).map((s) => (
              <label
                key={s}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                  form.status === s
                    ? s === "active"
                      ? "border-emerald-600 bg-emerald-600/10 text-emerald-400"
                      : "border-red-700 bg-red-700/10 text-red-400"
                    : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={form.status === s}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    form.status === s
                      ? s === "active" ? "bg-emerald-400" : "bg-red-400"
                      : "bg-zinc-700"
                  }`}
                />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* Footer actions */}
      <div className="border-t border-zinc-800 px-6 py-4 flex gap-3 shrink-0">
        <button type="button" onClick={onClose} className={cancelBtnCls}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={submitBtnCls}>
          {submitting && <Spinner />}
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
