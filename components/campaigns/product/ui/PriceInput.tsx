import type { ChangeEvent } from "react";

interface PriceInputProps {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Tailwind text-color class for the $ symbol, e.g. "text-emerald-500" */
  accent: string;
}

export default function PriceInput({ name, value, onChange, accent }: PriceInputProps) {
  return (
    <div className="relative">
      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${accent}`}>
        $
      </span>
      <input
        name={name}
        type="number"
        step="0.001"
        min="0"
        value={value}
        onChange={onChange}
        placeholder="0.000"
        className="w-full rounded-lg border border-zinc-800 bg-[#0a0c10] pl-6 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/40"
      />
    </div>
  );
}
