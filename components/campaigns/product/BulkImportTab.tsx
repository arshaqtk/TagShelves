"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import type { CampaignProduct } from "../types";
import type { ParsedRow } from "./types";
import { cancelBtnCls, submitBtnCls } from "./types";
import { parseCSV } from "./csvParser";
import BulkDropZone from "./BulkDropZone";
import BulkPreviewTable from "./BulkPreviewTable";
import Spinner from "./ui/Spinner";

type BulkStage = "drop" | "preview" | "uploading" | "done" | "error";

interface BulkImportTabProps {
  onClose: () => void;
  onBulkSaved: (products: CampaignProduct[]) => void;
}

export default function BulkImportTab({ onClose, onBulkSaved }: BulkImportTabProps) {
  const [stage, setStage] = useState<BulkStage>("drop");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [uploadMsg, setUploadMsg] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validRows = rows.filter((r) => !r._error);
  const errorRows = rows.filter((r) => r._error);

  // ── File reading ──────────────────────────────────────────────────────────

  const readFile = (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls|txt)$/i)) {
      setUploadMsg("Please upload a .csv, .xlsx or .xls file.");
      setStage("error");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setUploadMsg("No rows found in file. Check the format below.");
        setStage("error");
        return;
      }
      setRows(parsed);
      setStage("preview");
    };
    reader.readAsText(file);
  };

  // ── Drop-zone handlers ────────────────────────────────────────────────────

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  // ── Table row actions ─────────────────────────────────────────────────────

  const handleRemoveRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    setStage("drop");
    setRows([]);
    setFileName("");
    setUploadMsg("");
    setSavedCount(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (validRows.length === 0) return;
    setStage("uploading");
    setUploadMsg("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRows),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Upload failed.");

      const saved: CampaignProduct[] = (data.products ?? []).map(
        (raw: Record<string, unknown>) => ({
          id: String(raw._id ?? ""),
          name: String(raw.name ?? ""),
          code: String(raw.code ?? ""),
          promoPrice: Number(raw.promoPrice ?? 0),
          crossPrice: raw.crossPrice !== undefined ? Number(raw.crossPrice) : undefined,
          validUntil: raw.validUntil
            ? new Date(String(raw.validUntil)).toISOString()
            : null,
          offer: raw.offer ? String(raw.offer) : null,
          status: raw.status === "inactive" ? "inactive" : "active",
        })
      );

      setSavedCount(saved.length || data.count || validRows.length);
      onBulkSaved(saved);
      setStage("done");
    } catch (err: unknown) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed.");
      setStage("error");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Drop zone (shown in drop + error stages) */}
        {(stage === "drop" || stage === "error") && (
          <BulkDropZone
            isDragOver={isDragOver}
            errorMsg={stage === "error" ? uploadMsg : undefined}
            inputRef={inputRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileInput={handleFileInput}
          />
        )}

        {/* Preview table (shown in preview + uploading stages) */}
        {(stage === "preview" || stage === "uploading") && (
          <BulkPreviewTable
            rows={rows}
            fileName={fileName}
            validCount={validRows.length}
            errorCount={errorRows.length}
            onRemoveRow={handleRemoveRow}
            onChangeFile={handleReset}
          />
        )}

        {/* Done screen */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full bg-emerald-500/10 p-5 text-emerald-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-white text-lg font-bold">{savedCount} Products Imported!</p>
              <p className="text-zinc-500 text-xs mt-1">Your campaign has been updated.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Import More
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions (preview / uploading) */}
      {(stage === "preview" || stage === "uploading") && (
        <div className="border-t border-zinc-800 px-6 py-4 flex gap-3 shrink-0">
          <button type="button" onClick={handleReset} className={cancelBtnCls}>
            ← Back
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={stage === "uploading" || validRows.length === 0}
            className={`${submitBtnCls} ${validRows.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {stage === "uploading" ? (
              <><Spinner /> Importing...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import {validRows.length} Product{validRows.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
