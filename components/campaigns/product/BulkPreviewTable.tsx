"use client";

import type { ParsedRow } from "./types";

interface BulkPreviewTableProps {
  rows: ParsedRow[];
  fileName: string;
  validCount: number;
  errorCount: number;
  onRemoveRow: (index: number) => void;
  onChangeFile: () => void;
}

export default function BulkPreviewTable({
  rows,
  fileName,
  validCount,
  errorCount,
  onRemoveRow,
  onChangeFile,
}: BulkPreviewTableProps) {
  return (
    <div className="space-y-4">
      {/* File info bar */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400 shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[11px] text-zinc-300 font-medium truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-[10px] text-emerald-400 font-semibold">{validCount} valid</span>
          {errorCount > 0 && (
            <span className="text-[10px] text-red-400 font-semibold">{errorCount} skipped</span>
          )}
          <button
            type="button"
            onClick={onChangeFile}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
          >
            Change
          </button>
        </div>
      </div>

      {/* Preview table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full border-collapse text-[10px]">
            <thead className="bg-[#0c0f15] sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500">Status</th>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500">Name</th>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500">Code</th>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500">Promo $</th>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500">Cross $</th>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500">Offer</th>
                <th className="px-2 py-2 text-left font-semibold text-zinc-500 w-6" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-zinc-800/80 ${
                    row._error ? "bg-red-950/10" : "hover:bg-zinc-900/30"
                  }`}
                >
                  {/* Status cell */}
                  <td className="px-2 py-2">
                    {row._error ? (
                      <span className="flex items-center gap-1 text-red-400" title={row._error}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span className="truncate max-w-[60px]">{row._error}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        OK
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-2 text-zinc-300 max-w-[100px]">
                    <span className="truncate block">
                      {row.name || <span className="text-zinc-600 italic">—</span>}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-zinc-500 font-mono">{row.code || "—"}</td>
                  <td className="px-2 py-2 text-emerald-400 font-semibold">
                    {row.promoPrice > 0
                      ? `$${row.promoPrice.toFixed(3)}`
                      : <span className="text-red-400">—</span>}
                  </td>
                  <td className="px-2 py-2 text-zinc-500">
                    {row.crossPrice ? `$${row.crossPrice.toFixed(3)}` : "—"}
                  </td>
                  <td className="px-2 py-2 text-zinc-500">{row.offer || "—"}</td>

                  {/* Remove row */}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(idx)}
                      title="Remove row"
                      className="flex h-4 w-4 items-center justify-center text-zinc-700 hover:text-red-400 transition cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error row warning */}
      {errorCount > 0 && (
        <p className="text-[10px] text-amber-400 font-medium">
          ⚠ {errorCount} row{errorCount > 1 ? "s" : ""} will be skipped due to errors.
          Remove them or fix your file and re-upload.
        </p>
      )}
    </div>
  );
}
