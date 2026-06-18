"use client";

import type { DragEvent, ChangeEvent, RefObject } from "react";
import { downloadSampleCSV } from "./csvParser";

interface BulkDropZoneProps {
  isDragOver: boolean;
  errorMsg?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CSV_HEADERS = ["name *", "code *", "promoPrice *", "crossPrice", "validUntil", "offer", "status"];
const CSV_ROW_1  = ["Arroz Longo 1kg", "ARR001", "1.599", "2.299", "2025-12-31", "Flash Sale", "active"];
const CSV_ROW_2  = ["Vinho Tinto 750ml", "VIN002", "5.999", "", "", "Discount 20%", "active"];

export default function BulkDropZone({
  isDragOver,
  errorMsg,
  inputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
}: BulkDropZoneProps) {
  return (
    <div className="space-y-5">
      {/* Drop area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-emerald-500 bg-emerald-950/10"
            : "border-zinc-800 bg-[#0a0c10] hover:border-zinc-700 hover:bg-[#0f1218]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          className="hidden"
          onChange={onFileInput}
        />

        <div className={`rounded-full p-4 ${isDragOver ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800/60 text-zinc-400"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>

        <div>
          <p className="text-sm font-bold text-white">
            {isDragOver ? "Release to import" : "Drop your CSV file here"}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            or click to browse — .csv, .xlsx, .xls accepted
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
        )}
      </div>

      {/* Format guide */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#0a0c10] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Expected CSV format
        </p>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-[9px] border-collapse">
            <thead className="bg-zinc-900/60">
              <tr>
                {CSV_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1.5 text-left font-semibold text-zinc-400 whitespace-nowrap border-b border-zinc-800"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                {CSV_ROW_1.map((v, i) => (
                  <td key={i} className="px-2 py-1.5 text-zinc-500 whitespace-nowrap font-mono">{v}</td>
                ))}
              </tr>
              <tr>
                {CSV_ROW_2.map((v, i) => (
                  <td key={i} className="px-2 py-1.5 text-zinc-500 whitespace-nowrap font-mono">
                    {v || <span className="text-zinc-700">—</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[9px] text-zinc-600 mt-2">
          * Required columns. Column order doesn&apos;t matter.
        </p>
      </div>

      {/* Download template */}
      <button
        type="button"
        onClick={downloadSampleCSV}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 py-2 text-[10px] font-semibold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download sample CSV template
      </button>
    </div>
  );
}
