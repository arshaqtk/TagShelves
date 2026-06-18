"use client";

import { ChangeEvent, DragEvent, useState } from "react";

interface Product {
  name: string;
  code: string;
  promoPrice: number;
  crossPrice?: number;
  validUntil?: string;
  offer?: string;
  status: "active" | "inactive";
}

const MOCK_PRODUCTS: Product[] = [
  {
    name: "Farinha De Trigo 300g",
    code: "02145A45",
    promoPrice: 2.359,
    crossPrice: 3.299,
    validUntil: "2024-10-12",
    offer: "Discount 25%",
    status: "active",
  },
  {
    name: "Vinho Tinto Portugal 750 Ml",
    code: "02145A45",
    promoPrice: 2.359,
    crossPrice: 2.899,
    validUntil: "2024-10-12",
    offer: "Flash Sale",
    status: "active",
  },
  {
    name: "Sumo Compal 1L",
    code: "02145A45",
    promoPrice: 4.359,
    crossPrice: 5.499,
    validUntil: "2024-10-12",
    offer: "Discount",
    status: "inactive",
  },
];

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ImportStepProps {
  isDragOver: boolean;
  setIsDragOver: (dragOver: boolean) => void;
  importedFile: string | null;
  setImportedFile: (fileName: string | null) => void;
  onProductsUploaded?: (count: number) => void;
}

export default function ImportStep({
  isDragOver,
  setIsDragOver,
  importedFile,
  setImportedFile,
  onProductsUploaded,
}: ImportStepProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const uploadProducts = async (products: Product[], fileName: string) => {
    setUploadStatus("uploading");
    setUploadMessage("");
    setImportedFile(fileName);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadStatus("success");
      setUploadMessage(data.message);
      onProductsUploaded?.(data.count ?? products.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadStatus("error");
      setUploadMessage(message);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // For now use mock products — replace with real CSV/XLSX parsing as needed
      uploadProducts(MOCK_PRODUCTS, file.name);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // For now use mock products — replace with real CSV/XLSX parsing as needed
      uploadProducts(MOCK_PRODUCTS, file.name);
    }
  };

  const handleStartManually = () => {
    uploadProducts(MOCK_PRODUCTS, "Mock_List_Products.csv");
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl ${
          isDragOver
            ? "border-emerald-500 bg-emerald-950/10"
            : "border-zinc-800 bg-[#121620]/30 hover:bg-[#121620]/50 hover:border-zinc-700/80"
        }`}
      >
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={handleFileSelect}
        />

        {importedFile ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`p-4 rounded-full ${
                uploadStatus === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <svg
                  className="w-10 h-10 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : uploadStatus === "error" ? (
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <p className="text-white text-lg font-bold">
              {uploadStatus === "uploading"
                ? "Uploading..."
                : uploadStatus === "error"
                ? "Upload Failed"
                : "Products Saved!"}
            </p>
            <p className="text-zinc-400 text-sm">{importedFile}</p>

            {uploadMessage && (
              <p
                className={`text-xs font-medium ${
                  uploadStatus === "error" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {uploadMessage}
              </p>
            )}

            {uploadStatus !== "uploading" && (
              <span className="text-xs text-zinc-500 hover:text-zinc-300 underline">
                Change File
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 rounded-full bg-zinc-800/60 text-zinc-400">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold">
              Import Your Price List
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
              Drag &amp; Drop A CSV Or Excel File, Or Click To Browse
            </p>
          </div>
        )}
      </label>

      <button
        type="button"
        onClick={handleStartManually}
        disabled={uploadStatus === "uploading"}
        className="text-zinc-400 hover:text-zinc-300 hover:underline transition-all text-sm font-medium mt-6 cursor-pointer bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Or Start Manually Without Importing
      </button>
    </div>
  );
}
